/* CoTypeX 0.3.0 - shared standalone and Codex++ user script */
(() => {
  // cotypex:cotypex-assets
  var CSS_TEXT = '[data-cotypex-editor="true"] {\n  color: transparent !important;\n  caret-color: transparent !important;\n  text-shadow: none !important;\n  -webkit-text-fill-color: transparent !important;\n}\n\n[data-cotypex-editor="true"]::placeholder,\n[data-cotypex-editor="true"]::before,\n[data-cotypex-editor="true"] [data-placeholder]::before {\n  color: transparent !important;\n  opacity: 0 !important;\n  -webkit-text-fill-color: transparent !important;\n}\n\n.cotypex-overlay {\n  position: fixed;\n  z-index: 2147483000;\n  box-sizing: border-box;\n  overflow: hidden;\n  border-color: transparent !important;\n  background: transparent;\n  pointer-events: none;\n  user-select: none;\n}\n\n.cotypex-char {\n  position: relative;\n  color: color-mix(in srgb, currentColor 38%, transparent);\n  white-space: pre-wrap;\n}\n\n.cotypex-char[data-state="correct"] {\n  color: color-mix(in srgb, currentColor 76%, transparent);\n}\n\n.cotypex-char[data-state="incorrect"] {\n  border-radius: 2px;\n  background: color-mix(in srgb, #d14b4b 14%, transparent);\n  color: #d14b4b;\n}\n\n.cotypex-char[data-state="current"] {\n  color: inherit;\n}\n\n.cotypex-char[data-state="current"]::before {\n  position: absolute;\n  top: 0.08em;\n  bottom: 0.08em;\n  left: -1px;\n  width: 1.5px;\n  border-radius: 1px;\n  background: currentColor;\n  content: "";\n  animation: cotypex-caret 1s steps(1, end) infinite;\n}\n\n@keyframes cotypex-caret {\n  0%, 48% { opacity: 1; }\n  49%, 100% { opacity: 0.2; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .cotypex-char[data-state="current"]::before {\n    animation: none;\n  }\n}\n';
  var CORPUS = ["\u5148\u628A\u76EE\u6807\u548C\u7EA6\u675F\u5199\u6E05\u695A\uFF0C\u518D\u8BA9\u5B9E\u73B0\u6CBF\u7740\u540C\u4E00\u6761\u903B\u8F91\u8D70\u5230\u5E95\u3002", "\u628A\u590D\u6742\u95EE\u9898\u62C6\u6210\u80FD\u591F\u9A8C\u8BC1\u7684\u5C0F\u6B65\u9AA4\uFF0C\u6BCF\u4E00\u6B65\u90FD\u7559\u4E0B\u660E\u786E\u7684\u7ED3\u679C\u3002", "\u8BF7\u68C0\u67E5\u8F93\u5165\u3001\u72B6\u6001\u53D8\u5316\u548C\u6700\u7EC8\u8F93\u51FA\u4E4B\u95F4\u662F\u5426\u5F62\u6210\u5B8C\u6574\u95ED\u73AF\u3002", "\u7A33\u5B9A\u7684\u5DE5\u5177\u6765\u81EA\u6E05\u695A\u7684\u8FB9\u754C\uFF0C\u800C\u4E0D\u662F\u8D8A\u6765\u8D8A\u591A\u7684\u4E34\u65F6\u5206\u652F\u3002", "Write the smallest correct change, then verify the complete user flow.", "Good prompts describe the goal, the constraints, and the expected result.", "const result = await verify(input, constraints, expectedOutput);", "A reliable interface stays quiet until the user asks it to do real work.", "Measure twice, change once, and keep the behavior easy to explain.", "function solve(problem) { return analyze(problem).then(verify); }"];

  // src/engine.js
  function splitCharacters(value) {
    return Array.from(String(value ?? "").normalize("NFC"));
  }
  function createSession(targetText, now = 0) {
    const target = splitCharacters(targetText);
    if (target.length === 0) throw new Error("target text must not be empty");
    return {
      target,
      typed: [],
      startedAt: null,
      updatedAt: now,
      completedAt: null,
      keystrokes: 0,
      errors: 0
    };
  }
  function updateSession(session, nextValue, now = Date.now()) {
    const next = splitCharacters(nextValue).slice(0, session.target.length);
    const previous2 = session.typed;
    const common = commonPrefixLength(previous2, next);
    let keystrokes = session.keystrokes;
    let errors = session.errors;
    if (next.length > common) {
      for (let index = common; index < next.length; index += 1) {
        keystrokes += 1;
        if (next[index] !== session.target[index]) errors += 1;
      }
    }
    const startedAt = session.startedAt ?? (next.length > 0 ? now : null);
    const complete = next.length === session.target.length && next.every((character, index) => character === session.target[index]);
    return {
      ...session,
      typed: next,
      startedAt,
      updatedAt: now,
      completedAt: complete ? session.completedAt ?? now : null,
      keystrokes,
      errors
    };
  }
  function characterState(session, index) {
    if (index >= session.typed.length) return index === session.typed.length ? "current" : "pending";
    return session.typed[index] === session.target[index] ? "correct" : "incorrect";
  }
  function commonPrefixLength(left, right) {
    const length = Math.min(left.length, right.length);
    let index = 0;
    while (index < length && left[index] === right[index]) index += 1;
    return index;
  }

  // src/index.js
  var VERSION = "0.3.0";
  var GLOBAL_KEY = "__COTYPEX__";
  var STYLE_ID = "cotypex-style";
  var ROOT_ATTRIBUTE = "data-cotypex-root";
  var ACTIVE_EDITOR_ATTRIBUTE = "data-cotypex-editor";
  var previous = window[GLOBAL_KEY];
  if (previous?.version === VERSION) {
    previous.ensure?.();
  } else {
    previous?.destroy?.();
    install();
  }
  function install() {
    installStyle();
    const state = {
      active: false,
      editor: null,
      overlay: null,
      session: createSession(selectPrompt(-1)),
      promptIndex: -1,
      snapshot: null,
      composing: false,
      syncing: false,
      nextTimer: 0,
      ensureTimer: 0,
      layoutFrame: 0
    };
    const onKeyDown = (event) => {
      if (isToggleShortcut(event)) {
        stopEvent(event);
        state.active ? deactivate() : activate();
        return;
      }
      if (!state.active) return;
      if (event.key === "Escape") {
        stopEvent(event);
        deactivate();
        return;
      }
      if (state.composing || event.isComposing) return;
      if (event.key === "Tab" || event.key === "Enter") {
        stopEvent(event);
        startPrompt(true);
        return;
      }
      if (!eventTargetsEditor(event, state.editor)) return;
      if (isCaretNavigation(event) || (event.ctrlKey || event.metaKey) && event.code === "KeyA") {
        stopEvent(event);
        moveCaretToEnd(state.editor);
      }
    };
    const onBeforeInput = (event) => {
      if (!state.active || state.syncing || !eventTargetsEditor(event, state.editor)) return;
      if (["insertFromPaste", "insertFromDrop", "historyUndo", "historyRedo"].includes(event.inputType)) {
        stopEvent(event);
      }
    };
    const onInput = (event) => {
      if (!state.active || state.syncing || !eventTargetsEditor(event, state.editor)) return;
      state.composing ? render(readEditorText(state.editor)) : processInput();
    };
    const onCompositionStart = (event) => {
      if (!state.active || !eventTargetsEditor(event, state.editor)) return;
      state.composing = true;
    };
    const onCompositionEnd = (event) => {
      if (!state.active || !eventTargetsEditor(event, state.editor)) return;
      state.composing = false;
      processInput();
    };
    const onPointerDown = (event) => {
      if (!state.active) return;
      if (eventTargetsEditor(event, state.editor)) {
        stopEvent(event);
        focusEditor(state.editor);
        return;
      }
      if (isSubmissionControl(event.target, state.editor)) {
        stopEvent(event);
        focusEditor(state.editor);
        return;
      }
      deactivate();
    };
    const onClick = (event) => {
      if (!state.active || !isSubmissionControl(event.target, state.editor)) return;
      stopEvent(event);
      focusEditor(state.editor);
    };
    const onSubmit = (event) => {
      if (!state.active || !(event.target instanceof Element) || !event.target.contains(state.editor)) return;
      stopEvent(event);
      focusEditor(state.editor);
    };
    const onScroll = (event) => {
      if (!state.active) return;
      if (event.target === state.editor) syncOverlayScroll();
      scheduleLayout();
    };
    const onResize = () => scheduleLayout();
    const onBeforeUnload = () => {
      if (state.active) restoreSnapshot();
    };
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("beforeinput", onBeforeInput, true);
    window.addEventListener("input", onInput, true);
    window.addEventListener("compositionstart", onCompositionStart, true);
    window.addEventListener("compositionend", onCompositionEnd, true);
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("click", onClick, true);
    window.addEventListener("submit", onSubmit, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    window.addEventListener("beforeunload", onBeforeUnload);
    const observer = new MutationObserver(() => {
      if (!state.active) return;
      window.clearTimeout(state.ensureTimer);
      state.ensureTimer = window.setTimeout(ensureAttached, 80);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    function activate() {
      const editor = findMainComposer();
      if (!editor) return false;
      const snapshot = captureEditor(editor);
      state.active = true;
      state.editor = editor;
      state.snapshot = snapshot;
      state.promptIndex = -1;
      state.editor.setAttribute(ACTIVE_EDITOR_ATTRIBUTE, "true");
      createOverlay();
      startPrompt(true);
      return true;
    }
    function deactivate() {
      if (!state.active) return true;
      state.active = false;
      state.composing = false;
      window.clearTimeout(state.nextTimer);
      window.clearTimeout(state.ensureTimer);
      window.cancelAnimationFrame(state.layoutFrame);
      restoreSnapshot();
      state.editor?.removeAttribute(ACTIVE_EDITOR_ATTRIBUTE);
      state.overlay?.remove();
      state.overlay = null;
      state.editor = null;
      state.snapshot = null;
      return true;
    }
    function restoreSnapshot() {
      if (!state.editor || !state.snapshot || !state.editor.isConnected) return false;
      state.syncing = true;
      restoreEditorContent(state.editor, state.snapshot);
      state.syncing = false;
      restoreEditorSelection(state.editor, state.snapshot.selection);
      return true;
    }
    function createOverlay() {
      const overlay = document.createElement("div");
      overlay.className = "cotypex-overlay";
      overlay.setAttribute(ROOT_ATTRIBUTE, "true");
      overlay.setAttribute("aria-hidden", "true");
      document.body.appendChild(overlay);
      state.overlay = overlay;
      syncOverlayLayout();
    }
    function ensureAttached() {
      if (!state.active) return;
      installStyle();
      if (!state.editor?.isConnected) {
        deactivate();
        return;
      }
      syncOverlayLayout();
    }
    function processInput() {
      if (!state.editor) return;
      const maxLength = state.session.target.length;
      const value = splitCharacters(readEditorText(state.editor)).slice(0, maxLength).join("");
      if (value !== readEditorText(state.editor)) replaceEditorText(state.editor, value);
      const wasComplete = state.session.completedAt !== null;
      state.session = updateSession(state.session, value);
      render();
      if (!wasComplete && state.session.completedAt !== null) {
        window.clearTimeout(state.nextTimer);
        state.nextTimer = window.setTimeout(() => startPrompt(true), 900);
      }
    }
    function startPrompt(advance) {
      window.clearTimeout(state.nextTimer);
      const text = !advance && state.promptIndex >= 0 ? CORPUS[state.promptIndex] : selectPrompt(state.promptIndex);
      state.promptIndex = CORPUS.indexOf(text);
      state.session = createSession(text);
      replaceEditorText(state.editor, "");
      render();
      focusEditor(state.editor);
    }
    function replaceEditorText(editor, text) {
      if (!editor || readEditorText(editor) === text) return true;
      state.syncing = true;
      const changed = writeEditorText(editor, text);
      state.syncing = false;
      if (changed) moveCaretToEnd(editor);
      return changed;
    }
    function render(draftValue = null) {
      if (!state.overlay) return;
      const draft = draftValue === null ? state.session : { ...state.session, typed: splitCharacters(draftValue).slice(0, state.session.target.length) };
      const fragment = document.createDocumentFragment();
      state.session.target.forEach((character, index) => {
        const span = document.createElement("span");
        span.className = "cotypex-char";
        span.dataset.state = characterState(draft, index);
        span.textContent = character;
        fragment.appendChild(span);
      });
      state.overlay.replaceChildren(fragment);
      syncOverlayLayout();
    }
    function scheduleLayout() {
      window.cancelAnimationFrame(state.layoutFrame);
      state.layoutFrame = window.requestAnimationFrame(syncOverlayLayout);
    }
    function syncOverlayLayout() {
      if (!state.active || !state.editor?.isConnected || !state.overlay) return;
      const rect = state.editor.getBoundingClientRect();
      const computed = state.snapshot.appearance;
      Object.assign(state.overlay.style, {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        padding: computed.padding,
        borderWidth: computed.borderWidth,
        borderStyle: "solid",
        font: computed.font,
        lineHeight: computed.lineHeight,
        letterSpacing: computed.letterSpacing,
        textAlign: computed.textAlign,
        textIndent: computed.textIndent,
        textTransform: computed.textTransform,
        whiteSpace: computed.whiteSpace === "normal" ? "pre-wrap" : computed.whiteSpace,
        wordBreak: computed.wordBreak,
        overflowWrap: computed.overflowWrap,
        tabSize: computed.tabSize,
        direction: computed.direction,
        color: computed.color
      });
      syncOverlayScroll();
    }
    function syncOverlayScroll() {
      if (!state.editor || !state.overlay) return;
      state.overlay.scrollTop = state.editor.scrollTop;
      state.overlay.scrollLeft = state.editor.scrollLeft;
    }
    function destroy() {
      deactivate();
      observer.disconnect();
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("beforeinput", onBeforeInput, true);
      window.removeEventListener("input", onInput, true);
      window.removeEventListener("compositionstart", onCompositionStart, true);
      window.removeEventListener("compositionend", onCompositionEnd, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("submit", onSubmit, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.getElementById(STYLE_ID)?.remove();
      delete window[GLOBAL_KEY];
      return true;
    }
    window[GLOBAL_KEY] = {
      version: VERSION,
      toggle: () => state.active ? deactivate() : activate(),
      ensure: ensureAttached,
      destroy
    };
  }
  function installStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }
    if (style.textContent !== CSS_TEXT) style.textContent = CSS_TEXT;
  }
  function isToggleShortcut(event) {
    return event.ctrlKey && event.altKey && !event.shiftKey && !event.metaKey && event.code === "KeyT";
  }
  function isCaretNavigation(event) {
    return ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key);
  }
  function stopEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }
  function eventTargetsEditor(event, editor) {
    if (!editor) return false;
    return event.composedPath?.().includes(editor) || event.target === editor || editor.contains(event.target);
  }
  function findMainComposer() {
    const selectors = ["div.ProseMirror", "[contenteditable='true']", "textarea", "[role='textbox']"];
    const candidates = Array.from(document.querySelectorAll(selectors.join(","))).filter((node) => node instanceof HTMLElement).filter((node) => !node.closest(`[${ROOT_ATTRIBUTE}]`)).filter((node) => !node.closest("aside,nav,[role='dialog'],[aria-modal='true'],[role='menu'],[role='listbox']")).map((node) => ({ node, score: composerScore(node) })).filter((item) => Number.isFinite(item.score)).sort((left, right) => right.score - left.score);
    return candidates[0]?.node ?? null;
  }
  function composerScore(node) {
    const rect = node.getBoundingClientRect();
    if (rect.width < 180 || rect.height < 20 || rect.bottom <= 0 || rect.top >= innerHeight) return -Infinity;
    if (rect.bottom < innerHeight * 0.45) return -Infinity;
    const horizontalCenter = rect.left + rect.width / 2;
    const centerDistance = Math.abs(horizontalCenter - innerWidth / 2) / Math.max(1, innerWidth);
    const lowerPosition = rect.bottom / Math.max(1, innerHeight);
    const widthShare = Math.min(1, rect.width / Math.max(1, innerWidth));
    const composerClass = node.closest(".composer-surface-chrome") ? 30 : 0;
    const editorClass = node.matches("div.ProseMirror") ? 20 : 0;
    return lowerPosition * 100 + widthShare * 36 - centerDistance * 42 + composerClass + editorClass;
  }
  function captureEditor(editor) {
    const computed = getComputedStyle(editor);
    return {
      text: readEditorText(editor),
      html: isTextControl(editor) ? null : editor.innerHTML,
      selection: captureEditorSelection(editor),
      appearance: {
        padding: computed.padding,
        borderWidth: computed.borderWidth,
        font: computed.font,
        lineHeight: computed.lineHeight,
        letterSpacing: computed.letterSpacing,
        textAlign: computed.textAlign,
        textIndent: computed.textIndent,
        textTransform: computed.textTransform,
        whiteSpace: computed.whiteSpace,
        wordBreak: computed.wordBreak,
        overflowWrap: computed.overflowWrap,
        tabSize: computed.tabSize,
        direction: computed.direction,
        color: computed.caretColor === "rgba(0, 0, 0, 0)" ? computed.color : computed.caretColor
      }
    };
  }
  function readEditorText(editor) {
    return isTextControl(editor) ? editor.value : editor.textContent ?? "";
  }
  function writeEditorText(editor, text) {
    editor.focus({ preventScroll: true });
    if (isTextControl(editor)) {
      const prototype = editor instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(prototype, "value").set.call(editor, text);
      editor.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
      return editor.value === text;
    }
    const selection = document.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    selection.removeAllRanges();
    selection.addRange(range);
    const command = text.length > 0 ? "insertText" : "delete";
    const changed = document.execCommand(command, false, text);
    return changed && readEditorText(editor) === text;
  }
  function restoreEditorContent(editor, snapshot) {
    if (isTextControl(editor)) return writeEditorText(editor, snapshot.text);
    editor.focus({ preventScroll: true });
    const selection = document.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    selection.removeAllRanges();
    selection.addRange(range);
    const command = snapshot.html ? "insertHTML" : "delete";
    return document.execCommand(command, false, snapshot.html ?? "");
  }
  function isTextControl(editor) {
    return editor instanceof HTMLTextAreaElement || editor instanceof HTMLInputElement;
  }
  function captureEditorSelection(editor) {
    if (isTextControl(editor)) {
      return { start: editor.selectionStart ?? editor.value.length, end: editor.selectionEnd ?? editor.value.length };
    }
    const selection = document.getSelection();
    if (!selection?.rangeCount || !editor.contains(selection.anchorNode) || !editor.contains(selection.focusNode)) {
      const end = splitCharacters(readEditorText(editor)).length;
      return { start: end, end };
    }
    return {
      start: textOffset(editor, selection.anchorNode, selection.anchorOffset),
      end: textOffset(editor, selection.focusNode, selection.focusOffset)
    };
  }
  function restoreEditorSelection(editor, saved) {
    editor.focus({ preventScroll: true });
    if (isTextControl(editor)) {
      editor.setSelectionRange(saved.start, saved.end);
      return;
    }
    const selection = document.getSelection();
    const range = document.createRange();
    const start = textPosition(editor, saved.start);
    const end = textPosition(editor, saved.end);
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  function focusEditor(editor) {
    editor?.focus?.({ preventScroll: true });
    moveCaretToEnd(editor);
  }
  function moveCaretToEnd(editor) {
    if (!editor) return;
    if (isTextControl(editor)) {
      const end = editor.value.length;
      editor.setSelectionRange(end, end);
      return;
    }
    const selection = document.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  function textOffset(root, node, offset) {
    const range = document.createRange();
    range.selectNodeContents(root);
    range.setEnd(node, offset);
    return splitCharacters(range.toString()).length;
  }
  function textPosition(root, characterOffset) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let remaining = characterOffset;
    let last = root;
    while (walker.nextNode()) {
      last = walker.currentNode;
      const length = splitCharacters(last.nodeValue).length;
      if (remaining <= length) {
        const codeUnitOffset = splitCharacters(last.nodeValue).slice(0, remaining).join("").length;
        return { node: last, offset: codeUnitOffset };
      }
      remaining -= length;
    }
    return { node: last, offset: last === root ? root.childNodes.length : last.nodeValue.length };
  }
  function isSubmissionControl(target, editor) {
    if (!(target instanceof Element) || !editor) return false;
    const control = target.closest("button,input[type='submit'],[role='button']");
    if (!control) return false;
    const form = editor.closest("form");
    const surface = form ?? editor.closest(".composer-surface-chrome") ?? editor.parentElement;
    if (!surface?.contains(control) && !(form && control.form === form)) return false;
    if (control.matches("button[type='submit'],input[type='submit']")) return true;
    const label = `${control.getAttribute("aria-label") ?? ""} ${control.getAttribute("title") ?? ""}`.trim();
    return /(^|\s)(send|submit|发送|提交)(\s|$)/i.test(label);
  }
  function selectPrompt(previousIndex) {
    if (!Array.isArray(CORPUS) || CORPUS.length === 0) throw new Error("CoTypeX corpus must not be empty");
    if (CORPUS.length === 1) return CORPUS[0];
    const random = crypto.getRandomValues(new Uint32Array(1))[0] % CORPUS.length;
    const index = random === previousIndex ? (random + 1) % CORPUS.length : random;
    return CORPUS[index];
  }
})();
