/* CoTypeX 0.4.2 - shared standalone and Codex++ user script */
(() => {
  // cotypex:cotypex-assets
  var CSS_TEXT = '[data-cotypex-editor="true"] {\n  color: transparent !important;\n  caret-color: transparent !important;\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace !important;\n  text-shadow: none !important;\n  -webkit-text-fill-color: transparent !important;\n}\n\n[data-cotypex-editor="true"]::placeholder,\n[data-cotypex-editor="true"]::before,\n[data-cotypex-editor="true"] [data-placeholder]::before {\n  color: transparent !important;\n  opacity: 0 !important;\n  -webkit-text-fill-color: transparent !important;\n}\n\n.cotypex-overlay {\n  position: fixed;\n  z-index: 2147483000;\n  box-sizing: border-box;\n  overflow: hidden;\n  border-color: transparent !important;\n  background: transparent;\n  pointer-events: none;\n  user-select: none;\n}\n\n.cotypex-hud,\n.cotypex-result {\n  box-sizing: border-box;\n  color: var(--cotypex-fg, #eef2f0);\n  font: 11px/1.2 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;\n  letter-spacing: 0;\n}\n\n.cotypex-hud {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  min-height: 26px;\n  margin: -2px 0 6px;\n  overflow-x: auto;\n  overflow-y: hidden;\n  scrollbar-width: none;\n  white-space: nowrap;\n  pointer-events: auto;\n}\n\n.cotypex-hud::-webkit-scrollbar {\n  display: none;\n}\n\n.cotypex-hud-group,\n.cotypex-stats,\n.cotypex-result-line {\n  display: inline-flex;\n  align-items: center;\n  gap: 3px;\n  box-sizing: border-box;\n  min-width: 0;\n  border: 1px solid var(--cotypex-border, rgba(255, 255, 255, 0.12));\n  border-radius: 5px;\n  background: var(--cotypex-panel, rgba(18, 21, 22, 0.58));\n  box-shadow: none;\n  backdrop-filter: blur(8px);\n}\n\n.cotypex-hud-group,\n.cotypex-stats {\n  height: 24px;\n  padding: 1px;\n}\n\n.cotypex-hud-settings {\n  flex: 0 0 auto;\n}\n\n.cotypex-hud-button,\n.cotypex-select {\n  flex: 0 0 auto;\n  height: 20px;\n  box-sizing: border-box;\n  border: 0;\n  border-radius: 4px;\n  background: transparent;\n  color: inherit;\n  font: inherit;\n}\n\n.cotypex-hud-button {\n  min-width: 32px;\n  padding: 0 6px;\n  cursor: pointer;\n}\n\n.cotypex-hud-button[data-active="true"] {\n  background: var(--cotypex-active, rgba(255, 255, 255, 0.14));\n  color: var(--cotypex-strong, #ffffff);\n}\n\n.cotypex-hud-button:focus-visible,\n.cotypex-select:focus-visible {\n  outline: 1px solid var(--cotypex-focus, rgba(255, 255, 255, 0.34));\n  outline-offset: 1px;\n}\n\n.cotypex-select {\n  max-width: 76px;\n  padding: 0 4px;\n  cursor: pointer;\n  appearance: auto;\n}\n\n.cotypex-stats {\n  margin-left: auto;\n  padding: 1px 7px;\n  gap: 7px;\n}\n\n.cotypex-stat {\n  display: inline-flex;\n  align-items: baseline;\n  gap: 3px;\n  font-variant-numeric: tabular-nums;\n}\n\n.cotypex-stat-name {\n  color: var(--cotypex-muted, rgba(238, 242, 240, 0.58));\n}\n\n.cotypex-stat-value {\n  color: var(--cotypex-strong, #ffffff);\n  font-weight: 650;\n}\n\n.cotypex-result {\n  display: block;\n  margin: 6px 0 -1px;\n  pointer-events: none;\n}\n\n.cotypex-result[hidden] {\n  display: none;\n}\n\n.cotypex-result-line {\n  width: fit-content;\n  max-width: 100%;\n  padding: 5px 7px;\n  gap: 10px;\n}\n\n.cotypex-result-metric {\n  min-width: 0;\n}\n\n.cotypex-char {\n  position: relative;\n  color: color-mix(in srgb, currentColor 38%, transparent);\n  white-space: pre-wrap;\n}\n\n.cotypex-char[data-state="correct"] {\n  color: color-mix(in srgb, currentColor 76%, transparent);\n}\n\n.cotypex-char[data-state="incorrect"] {\n  border-radius: 2px;\n  background: color-mix(in srgb, #d14b4b 14%, transparent);\n  color: #d14b4b;\n}\n\n.cotypex-char[data-state="current"] {\n  color: inherit;\n}\n\n.cotypex-char[data-state="current"]::before {\n  position: absolute;\n  top: 0.08em;\n  bottom: 0.08em;\n  left: -1px;\n  width: 1.5px;\n  border-radius: 1px;\n  background: currentColor;\n  content: "";\n  animation: cotypex-caret 1s steps(1, end) infinite;\n}\n\n@keyframes cotypex-caret {\n  0%, 48% { opacity: 1; }\n  49%, 100% { opacity: 0.2; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .cotypex-char[data-state="current"]::before {\n    animation: none;\n  }\n}\n';
  var CORPUS = { "javascript": ['const total = cart.items.reduce((sum, item) => {\n  return sum + item.price * item.quantity;\n}, 0);\n\nawait orders.create({ customerId, total, status: "pending" });', 'async function loadCustomerOrders(customerId) {\n  const response = await fetch(`/api/customers/${customerId}/orders`);\n  if (!response.ok) throw new Error("Failed to load orders");\n  return response.json();\n}', "const available = inventory.filter((item) => item.stock > 0);\nconst result = available.map(({ sku, name, price }) => ({\n  sku,\n  name,\n  price,\n}));"], "typescript": ['type OrderStatus = "pending" | "paid" | "shipped";\n\ninterface Order {\n  id: string;\n  total: number;\n  status: OrderStatus;\n}\n\nconst paidOrders = orders.filter((order: Order) => order.status === "paid");', "async function reserveStock(sku: string, quantity: number): Promise<boolean> {\n  const item = await inventory.findBySku(sku);\n  if (!item || item.available < quantity) return false;\n  await inventory.update(sku, { available: item.available - quantity });\n  return true;\n}", "function calculateInvoice(lines: InvoiceLine[]): number {\n  return lines.reduce((total, line) => {\n    const subtotal = line.unitPrice * line.quantity;\n    return total + subtotal * (1 - line.discount);\n  }, 0);\n}"], "python": ['def calculate_order_total(items):\n    return sum(\n        item["price"] * item["quantity"]\n        for item in items\n        if item["quantity"] > 0\n    )', 'async def create_payment(order_id, amount):\n    order = await orders.get(order_id)\n    if order is None or order.status != "pending":\n        raise ValueError("Order cannot be paid")\n    return await payments.create(order_id=order_id, amount=amount)', 'def list_active_customers(customers):\n    return [\n        {"id": customer.id, "email": customer.email}\n        for customer in customers\n        if customer.is_active\n    ]'], "java": ["public BigDecimal calculateTotal(List<OrderItem> items) {\n    return items.stream()\n        .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))\n        .reduce(BigDecimal.ZERO, BigDecimal::add);\n}", "public Order shipOrder(String orderId) {\n    Order order = repository.findById(orderId)\n        .orElseThrow(() -> new OrderNotFoundException(orderId));\n    order.setStatus(OrderStatus.SHIPPED);\n    return repository.save(order);\n}", "public List<Customer> findActiveCustomers(String region) {\n    return customers.stream()\n        .filter(Customer::isActive)\n        .filter(customer -> region.equals(customer.getRegion()))\n        .toList();\n}"], "go": ["func CalculateTotal(items []OrderItem) int64 {\n    var total int64\n    for _, item := range items {\n        total += item.UnitPrice * int64(item.Quantity)\n    }\n    return total\n}", 'func (s *OrderService) FindOrder(ctx context.Context, id string) (*Order, error) {\n    order, err := s.repo.FindByID(ctx, id)\n    if err != nil {\n        return nil, fmt.Errorf("find order %s: %w", id, err)\n    }\n    return order, nil\n}', "func ReserveStock(item *InventoryItem, quantity int) bool {\n    if quantity <= 0 || item.Available < quantity {\n        return false\n    }\n    item.Available -= quantity\n    return true\n}"], "rust": ["fn calculate_total(items: &[OrderItem]) -> i64 {\n    items\n        .iter()\n        .map(|item| item.unit_price * item.quantity as i64)\n        .sum()\n}", "async fn find_order(repo: &OrderRepository, id: &str) -> Result<Order, OrderError> {\n    repo.find_by_id(id)\n        .await?\n        .ok_or_else(|| OrderError::NotFound(id.to_owned()))\n}", "fn reserve_stock(item: &mut InventoryItem, quantity: u32) -> bool {\n    if item.available < quantity {\n        return false;\n    }\n    item.available -= quantity;\n    true\n}"], "sql": ["SELECT\n  customer_id,\n  COUNT(*) AS order_count,\n  SUM(total_amount) AS lifetime_value\nFROM orders\nWHERE status = 'paid'\nGROUP BY customer_id\nHAVING SUM(total_amount) > 1000\nORDER BY lifetime_value DESC;", "UPDATE inventory\nSET available = available - :quantity,\n    updated_at = CURRENT_TIMESTAMP\nWHERE sku = :sku\n  AND available >= :quantity;", "SELECT\n  DATE_TRUNC('month', paid_at) AS month,\n  SUM(total_amount) AS revenue\nFROM orders\nWHERE paid_at >= :start_date\nGROUP BY DATE_TRUNC('month', paid_at)\nORDER BY month;"], "csharp": ["public decimal CalculateTotal(IEnumerable<OrderItem> items)\n{\n    return items.Sum(item => item.UnitPrice * item.Quantity);\n}", "public async Task<Order> ShipOrderAsync(Guid orderId)\n{\n    var order = await repository.FindAsync(orderId)\n        ?? throw new OrderNotFoundException(orderId);\n    order.Status = OrderStatus.Shipped;\n    return await repository.SaveAsync(order);\n}", "public IEnumerable<Customer> FindActiveCustomers(string region)\n{\n    return customers\n        .Where(customer => customer.IsActive)\n        .Where(customer => customer.Region == region);\n}"], "php": ["function calculateOrderTotal(array $items): float\n{\n    return array_reduce($items, function (float $total, array $item): float {\n        return $total + $item['price'] * $item['quantity'];\n    }, 0.0);\n}", "function reserveStock(array &$item, int $quantity): bool\n{\n    if ($quantity <= 0 || $item['available'] < $quantity) {\n        return false;\n    }\n    $item['available'] -= $quantity;\n    return true;\n}", "$paidOrders = array_filter(\n    $orders,\n    fn (array $order): bool => $order['status'] === 'paid'\n);"] };

  // src/engine.js
  function splitCharacters(value) {
    return Array.from(String(value ?? "").normalize("NFC"));
  }
  function createSession(targetText, now = 0, options = {}) {
    const target = splitCharacters(targetText);
    if (target.length === 0) throw new Error("target text must not be empty");
    return {
      target,
      typed: [],
      mode: options.mode ?? "quote",
      limit: options.limit ?? null,
      startedAt: null,
      updatedAt: now,
      completedAt: null,
      completedReason: null,
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
    const targetComplete = next.length === session.target.length && next.every((character, index) => character === session.target[index]);
    const timeComplete = isTimedOut({ ...session, startedAt }, now);
    const complete = targetComplete || timeComplete;
    return {
      ...session,
      typed: next,
      startedAt,
      updatedAt: now,
      completedAt: complete ? session.completedAt ?? now : null,
      completedReason: complete ? session.completedReason ?? (timeComplete ? "time" : "target") : null,
      keystrokes,
      errors
    };
  }
  function refreshSession(session, now = Date.now()) {
    if (session.completedAt !== null || !isTimedOut(session, now)) {
      return { ...session, updatedAt: now };
    }
    return {
      ...session,
      updatedAt: now,
      completedAt: now,
      completedReason: "time"
    };
  }
  function sessionMetrics(session, now = Date.now()) {
    const elapsedMs = session.startedAt === null ? 0 : Math.max(0, (session.completedAt ?? now) - session.startedAt);
    const correctPositions = session.typed.reduce(
      (total, character, index) => total + Number(character === session.target[index]),
      0
    );
    const minutes = Math.max(elapsedMs / 6e4, 1 / 60);
    const accuracy = session.keystrokes === 0 ? 100 : Math.max(0, (session.keystrokes - session.errors) / session.keystrokes * 100);
    const remainingMs = session.mode === "time" && Number.isFinite(session.limit) ? Math.max(0, session.limit * 1e3 - elapsedMs) : null;
    const incorrectPositions = session.typed.reduce(
      (total, character, index) => total + Number(character !== session.target[index]),
      0
    );
    return {
      elapsedMs,
      remainingMs,
      correctPositions,
      incorrectPositions,
      charactersTyped: session.typed.length,
      keystrokes: session.keystrokes,
      errors: session.errors,
      progress: correctPositions / session.target.length,
      wpm: Math.round(correctPositions / 5 / minutes),
      rawWpm: Math.round(session.typed.length / 5 / minutes),
      accuracy: Math.round(accuracy),
      complete: session.completedAt !== null
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
  function isTimedOut(session, now) {
    return session.mode === "time" && Number.isFinite(session.limit) && session.startedAt !== null && now - session.startedAt >= session.limit * 1e3;
  }

  // src/index.js
  var VERSION = "0.4.2";
  var GLOBAL_KEY = "__COTYPEX__";
  var STYLE_ID = "cotypex-style";
  var ROOT_ATTRIBUTE = "data-cotypex-root";
  var ACTIVE_EDITOR_ATTRIBUTE = "data-cotypex-editor";
  var ACTIVE_SURFACE_ATTRIBUTE = "data-cotypex-surface";
  var SETTINGS_KEY = "cotypex.settings.v1";
  var HISTORY_KEY = "cotypex.history.v1";
  var HISTORY_LIMIT = 80;
  var PRESETS = [
    { id: "time-15", label: "15s", mode: "time", limit: 15 },
    { id: "time-30", label: "30s", mode: "time", limit: 30 },
    { id: "time-60", label: "60s", mode: "time", limit: 60 },
    { id: "words-25", label: "25w", mode: "words", limit: 25 },
    { id: "words-50", label: "50w", mode: "words", limit: 50 },
    { id: "quote", label: "snippet", mode: "quote", limit: null }
  ];
  var LANGUAGE_OPTIONS = [
    { value: "javascript", label: "JS" },
    { value: "typescript", label: "TS" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "sql", label: "SQL" },
    { value: "csharp", label: "C#" },
    { value: "php", label: "PHP" }
  ];
  var previous = window[GLOBAL_KEY];
  if (previous?.version === VERSION) {
    previous.ensure?.();
  } else {
    previous?.destroy?.();
    install();
  }
  function install() {
    installStyle();
    const initialSettings = loadSettings();
    const state = {
      active: false,
      editor: null,
      surface: null,
      overlay: null,
      hud: null,
      result: null,
      session: createSession(buildTarget(initialSettings, -1), 0, sessionOptions(initialSettings)),
      settings: initialSettings,
      history: loadHistory(),
      promptIndex: -1,
      snapshot: null,
      surfaceStyles: null,
      editorStyles: null,
      surfaceBaseHeight: 0,
      editorBaseHeight: 0,
      composing: false,
      syncing: false,
      resultSaved: false,
      nextTimer: 0,
      ensureTimer: 0,
      statsTimer: 0,
      layoutFrame: 0,
      layoutPasses: 0,
      layoutObserver: null
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
      if (!eventTargetsEditor(event, state.editor)) return;
      if (event.key === "Enter") {
        stopEvent(event);
        if (!insertExpectedWhitespace("\n")) startPrompt(true);
        return;
      }
      if (event.key === "Tab") {
        stopEvent(event);
        if (!insertExpectedIndentation()) startPrompt(true);
        return;
      }
      if (state.session.completedAt !== null) {
        stopEvent(event);
        focusEditor(state.editor);
        return;
      }
      if (isCaretNavigation(event) || (event.ctrlKey || event.metaKey) && event.code === "KeyA") {
        stopEvent(event);
        moveCaretToEnd(state.editor);
      }
    };
    const onBeforeInput = (event) => {
      if (!state.active || state.syncing || !eventTargetsEditor(event, state.editor)) return;
      if (["insertParagraph", "insertLineBreak"].includes(event.inputType)) {
        stopEvent(event);
        if (!insertExpectedWhitespace("\n")) focusEditor(state.editor);
        return;
      }
      if (state.session.completedAt !== null) {
        stopEvent(event);
        return;
      }
      if (["insertFromPaste", "insertFromDrop", "historyUndo", "historyRedo"].includes(event.inputType)) {
        stopEvent(event);
      }
    };
    const onKeyPressOrUp = (event) => {
      if (!state.active || !eventTargetsEditor(event, state.editor)) return;
      if (event.key === "Enter" || event.key === "Tab") stopEvent(event);
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
      if (event.target instanceof Element && event.target.closest(`[${ROOT_ATTRIBUTE}]`)) return;
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
      if (state.active && event.target instanceof Element && event.target.closest(`[${ROOT_ATTRIBUTE}]`)) return;
      if (!state.active || !isSubmissionControl(event.target, state.editor)) return;
      stopEvent(event);
      focusEditor(state.editor);
    };
    const onSubmit = (event) => {
      if (!state.active) return;
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
    window.addEventListener("keypress", onKeyPressOrUp, true);
    window.addEventListener("keyup", onKeyPressOrUp, true);
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
    const observer = new MutationObserver((records) => {
      if (!state.active) return;
      const hostChanged = records.some((record) => {
        const target = record.target instanceof Element ? record.target : record.target.parentElement;
        return !target?.closest?.(`[${ROOT_ATTRIBUTE}]`);
      });
      if (!hostChanged) return;
      window.clearTimeout(state.ensureTimer);
      state.ensureTimer = window.setTimeout(ensureAttached, 80);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    function activate() {
      const editor = findMainComposer();
      if (!editor) return false;
      const snapshot = captureEditor(editor);
      try {
        state.active = true;
        state.editor = editor;
        state.surface = findComposerSurface(editor);
        state.snapshot = snapshot;
        state.surfaceStyles = captureInlineStyles(state.surface, ["minHeight", "transition"]);
        state.editorStyles = captureInlineStyles(state.editor, ["minHeight", "transition"]);
        state.surfaceBaseHeight = Math.ceil(state.surface.getBoundingClientRect().height);
        state.editorBaseHeight = Math.ceil(state.editor.getBoundingClientRect().height);
        state.promptIndex = -1;
        state.editor.setAttribute(ACTIVE_EDITOR_ATTRIBUTE, "true");
        state.surface.setAttribute(ACTIVE_SURFACE_ATTRIBUTE, "true");
        applyComposerLift();
        createChrome();
        watchComposerLayout();
        startPrompt(true);
        scheduleLayout(4);
        state.statsTimer = window.setInterval(tickSession, 250);
        return true;
      } catch (error) {
        console.error("CoTypeX activation failed", error);
        deactivate();
        return false;
      }
    }
    function deactivate() {
      if (!state.active) return true;
      state.active = false;
      state.composing = false;
      window.clearTimeout(state.nextTimer);
      window.clearTimeout(state.ensureTimer);
      window.clearInterval(state.statsTimer);
      window.cancelAnimationFrame(state.layoutFrame);
      state.layoutObserver?.disconnect();
      restoreSnapshot();
      restoreInlineStyles(state.surface, state.surfaceStyles);
      restoreInlineStyles(state.editor, state.editorStyles);
      state.editor?.removeAttribute(ACTIVE_EDITOR_ATTRIBUTE);
      state.surface?.removeAttribute(ACTIVE_SURFACE_ATTRIBUTE);
      state.overlay?.remove();
      state.hud?.remove();
      state.result?.remove();
      state.overlay = null;
      state.hud = null;
      state.result = null;
      state.editor = null;
      state.surface = null;
      state.snapshot = null;
      state.surfaceStyles = null;
      state.editorStyles = null;
      state.surfaceBaseHeight = 0;
      state.editorBaseHeight = 0;
      state.layoutFrame = 0;
      state.layoutPasses = 0;
      state.layoutObserver = null;
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
    function createChrome() {
      state.overlay?.remove();
      state.hud?.remove();
      state.result?.remove();
      const overlay = document.createElement("div");
      overlay.className = "cotypex-overlay";
      overlay.setAttribute(ROOT_ATTRIBUTE, "true");
      overlay.setAttribute("aria-hidden", "true");
      document.body.appendChild(overlay);
      state.overlay = overlay;
      const hud = document.createElement("div");
      hud.className = "cotypex-hud";
      hud.setAttribute(ROOT_ATTRIBUTE, "true");
      hud.addEventListener("pointerdown", stopHudPropagation);
      hud.addEventListener("click", onHudClick);
      hud.addEventListener("change", onHudChange);
      const editorBranch = directChildContaining(state.surface, state.editor);
      if (!editorBranch) throw new Error("The Codex editor is outside its composer surface");
      state.surface.insertBefore(hud, editorBranch);
      state.hud = hud;
      const result = document.createElement("div");
      result.className = "cotypex-result";
      result.setAttribute(ROOT_ATTRIBUTE, "true");
      result.hidden = true;
      state.surface.insertBefore(result, editorBranch.nextSibling);
      state.result = result;
      renderHud();
      syncOverlayLayout();
      scheduleLayout(4);
    }
    function watchComposerLayout() {
      state.layoutObserver?.disconnect();
      if (typeof ResizeObserver !== "function" || !state.editor || !state.surface) return;
      state.layoutObserver = new ResizeObserver(() => scheduleLayout(2));
      state.layoutObserver.observe(state.editor);
      if (state.surface !== state.editor) state.layoutObserver.observe(state.surface);
    }
    function ensureAttached() {
      if (!state.active) return;
      installStyle();
      if (!state.editor?.isConnected || !state.surface?.isConnected) {
        deactivate();
        return;
      }
      if (!state.overlay?.isConnected || !state.hud?.isConnected || !state.result?.isConnected) {
        createChrome();
      }
      applyComposerLift();
      syncOverlayLayout();
    }
    function processInput() {
      if (!state.editor) return;
      if (state.session.completedAt !== null) {
        replaceEditorText(state.editor, state.session.typed.join(""));
        focusEditor(state.editor);
        return;
      }
      const maxLength = state.session.target.length;
      const value = splitCharacters(readEditorText(state.editor)).slice(0, maxLength).join("");
      if (value !== readEditorText(state.editor)) replaceEditorText(state.editor, value);
      const wasComplete = state.session.completedAt !== null;
      state.session = updateSession(state.session, value);
      render();
      renderHud();
      if (!wasComplete && state.session.completedAt !== null) {
        finishSession();
      }
    }
    function insertExpectedWhitespace(character) {
      const index = state.session.typed.length;
      if (state.session.target[index] !== character) return false;
      replaceEditorText(state.editor, `${state.session.typed.join("")}${character}`);
      processInput();
      return true;
    }
    function insertExpectedIndentation() {
      const remaining = state.session.target.slice(state.session.typed.length).join("");
      const indentation = remaining.match(/^ +/)?.[0];
      if (!indentation) return false;
      replaceEditorText(state.editor, `${state.session.typed.join("")}${indentation}`);
      processInput();
      return true;
    }
    function startPrompt(advance) {
      window.clearTimeout(state.nextTimer);
      const text = !advance && state.promptIndex >= 0 && activePreset().mode === "quote" ? quoteCorpus(state.settings.language)[state.promptIndex] : buildTarget(state.settings, state.promptIndex);
      state.promptIndex = activePreset().mode === "quote" ? quoteCorpus(state.settings.language).indexOf(text) : -1;
      state.session = createSession(text, Date.now(), sessionOptions(state.settings));
      state.resultSaved = false;
      if (state.result) state.result.hidden = true;
      replaceEditorText(state.editor, "");
      render();
      renderHud();
      focusEditor(state.editor);
    }
    function tickSession() {
      if (!state.active || !state.editor) return;
      const wasComplete = state.session.completedAt !== null;
      state.session = refreshSession(state.session);
      if (!wasComplete && state.session.completedAt !== null) finishSession();
      renderHud();
    }
    function finishSession() {
      if (state.resultSaved) return;
      state.resultSaved = true;
      saveResult();
      renderHud();
      renderResult();
    }
    function onHudClick(event) {
      event.stopPropagation();
      const target = event.target instanceof Element ? event.target.closest("button") : null;
      if (!target) return;
      if (target.dataset.preset) {
        state.settings = { ...state.settings, presetId: target.dataset.preset };
        saveSettings(state.settings);
        startPrompt(true);
        return;
      }
    }
    function onHudChange(event) {
      event.stopPropagation();
      if (!(event.target instanceof HTMLSelectElement) || event.target.dataset.setting !== "language") return;
      state.settings = { ...state.settings, language: event.target.value };
      saveSettings(state.settings);
      startPrompt(true);
    }
    function stopHudPropagation(event) {
      event.stopPropagation();
    }
    function saveResult() {
      const metrics = sessionMetrics(state.session, state.session.completedAt ?? Date.now());
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        presetId: state.settings.presetId,
        language: state.settings.language,
        wpm: metrics.wpm,
        rawWpm: metrics.rawWpm,
        accuracy: metrics.accuracy,
        errors: metrics.errors,
        elapsedMs: metrics.elapsedMs,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      state.history = [entry, ...state.history].slice(0, HISTORY_LIMIT);
      saveHistory(state.history);
    }
    function bestResult() {
      return state.history.filter((entry) => entry.presetId === state.settings.presetId && entry.language === state.settings.language).sort((left, right) => right.wpm - left.wpm || right.accuracy - left.accuracy)[0] ?? null;
    }
    function activePreset() {
      return PRESETS.find((preset) => preset.id === state.settings.presetId) ?? PRESETS[2];
    }
    function applyComposerLift() {
      if (!state.editor || !state.surface) return;
      const liftedEditorHeight = Math.max(96, state.editorBaseHeight + 56);
      const liftedSurfaceHeight = Math.max(state.surfaceBaseHeight + 76, liftedEditorHeight + 74);
      state.editor.style.transition = appendTransition(state.editorStyles?.transition, "min-height 180ms ease");
      state.editor.style.minHeight = `${liftedEditorHeight}px`;
      state.surface.style.transition = appendTransition(state.surfaceStyles?.transition, "min-height 180ms ease");
      state.surface.style.minHeight = `${liftedSurfaceHeight}px`;
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
    function renderHud() {
      if (!state.hud) return;
      const preset = activePreset();
      const metrics = sessionMetrics(state.session);
      if (!state.hud.firstElementChild) createHudContents(state.hud);
      for (const button of state.hud.querySelectorAll("[data-preset]")) {
        button.dataset.active = String(button.dataset.preset === state.settings.presetId);
      }
      const language = state.hud.querySelector("[data-setting='language']");
      if (language instanceof HTMLSelectElement && language.value !== state.settings.language) {
        language.value = state.settings.language;
      }
      const values = [
        ["wpm", metrics.wpm],
        ["acc", `${metrics.accuracy}%`],
        ["err", metrics.errors],
        [preset.mode === "time" ? "left" : "done", progressLabel(metrics, preset)]
      ];
      const stats = state.hud.querySelectorAll(".cotypex-stats > .cotypex-stat");
      values.forEach(([label, value], index) => updateStatNode(stats[index], label, value));
    }
    function renderResult() {
      if (!state.result) return;
      const metrics = sessionMetrics(state.session, state.session.completedAt ?? Date.now());
      const best = bestResult();
      state.result.hidden = false;
      const line = document.createElement("div");
      line.className = "cotypex-result-line";
      line.appendChild(resultMetric("wpm", metrics.wpm));
      line.appendChild(resultMetric("raw", metrics.rawWpm));
      line.appendChild(resultMetric("acc", `${metrics.accuracy}%`));
      line.appendChild(resultMetric("err", metrics.errors));
      line.appendChild(resultMetric("best", best ? best.wpm : metrics.wpm));
      state.result.replaceChildren(line);
      syncOverlayLayout();
    }
    function scheduleLayout(passes = 1) {
      state.layoutPasses = Math.max(state.layoutPasses, passes);
      if (state.layoutFrame) return;
      state.layoutFrame = window.requestAnimationFrame(runLayoutPass);
    }
    function runLayoutPass() {
      state.layoutFrame = 0;
      if (!state.active) {
        state.layoutPasses = 0;
        return;
      }
      syncOverlayLayout();
      state.layoutPasses = Math.max(0, state.layoutPasses - 1);
      if (state.layoutPasses > 0) {
        state.layoutFrame = window.requestAnimationFrame(runLayoutPass);
      }
    }
    function syncOverlayLayout() {
      if (!state.active || !state.editor?.isConnected || !state.overlay) return;
      const rect = state.editor.getBoundingClientRect();
      const computed = state.snapshot.appearance;
      const palette = chromePalette(computed.color);
      Object.assign(state.overlay.style, {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        padding: computed.padding,
        borderWidth: computed.borderWidth,
        borderStyle: "solid",
        font: computed.font,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
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
      if (state.hud) {
        Object.assign(state.hud.style, {
          "--cotypex-fg": palette.fg,
          "--cotypex-muted": palette.muted,
          "--cotypex-strong": palette.strong,
          "--cotypex-panel": palette.panel,
          "--cotypex-active": palette.active,
          "--cotypex-border": palette.border,
          "--cotypex-focus": palette.focus
        });
        if (state.result) {
          Object.assign(state.result.style, {
            "--cotypex-fg": palette.fg,
            "--cotypex-muted": palette.muted,
            "--cotypex-strong": palette.strong,
            "--cotypex-panel": palette.panel,
            "--cotypex-active": palette.active,
            "--cotypex-border": palette.border,
            "--cotypex-focus": palette.focus
          });
        }
      }
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
      window.removeEventListener("keypress", onKeyPressOrUp, true);
      window.removeEventListener("keyup", onKeyPressOrUp, true);
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
  function defaultSettings() {
    return {
      presetId: "time-60",
      language: "typescript"
    };
  }
  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "null");
      const settings = { ...defaultSettings(), ...saved && typeof saved === "object" ? saved : {} };
      if (!PRESETS.some((preset) => preset.id === settings.presetId)) settings.presetId = "time-60";
      if (!LANGUAGE_OPTIONS.some((option) => option.value === settings.language)) settings.language = "typescript";
      return settings;
    } catch {
      return defaultSettings();
    }
  }
  function saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
    }
  }
  function loadHistory() {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
      return Array.isArray(saved) ? saved.slice(0, HISTORY_LIMIT) : [];
    } catch {
      return [];
    }
  }
  function saveHistory(history) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_LIMIT)));
    } catch {
    }
  }
  function sessionOptions(settings) {
    const preset = presetFor(settings.presetId);
    return { mode: preset.mode, limit: preset.limit };
  }
  function buildTarget(settings, previousIndex = -1) {
    const preset = presetFor(settings.presetId);
    if (preset.mode === "quote") return selectPrompt(previousIndex, settings.language);
    const snippets = quoteCorpus(settings.language);
    if (preset.mode === "words") {
      return [...snippets].sort((left, right) => wordCount(left) - wordCount(right))[preset.limit <= 25 ? 0 : snippets.length - 1];
    }
    const parts = [];
    const targetLength = Math.max(160, preset.limit * 10);
    while (parts.join("\n\n").length < targetLength) {
      const previous2 = parts.at(-1);
      const choices = snippets.filter((snippet) => snippet !== previous2);
      parts.push(choices[randomIndex(choices.length)] ?? snippets[0]);
    }
    return parts.join("\n\n");
  }
  function createHudContents(hud) {
    const presets = document.createElement("div");
    presets.className = "cotypex-hud-group";
    for (const item of PRESETS) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cotypex-hud-button";
      button.dataset.preset = item.id;
      button.textContent = item.label;
      presets.appendChild(button);
    }
    const settings = document.createElement("div");
    settings.className = "cotypex-hud-group cotypex-hud-settings";
    const language = document.createElement("select");
    language.className = "cotypex-select";
    language.dataset.setting = "language";
    language.title = "Programming language";
    for (const option of LANGUAGE_OPTIONS) {
      const element = document.createElement("option");
      element.value = option.value;
      element.textContent = option.label;
      language.appendChild(element);
    }
    settings.appendChild(language);
    const stats = document.createElement("div");
    stats.className = "cotypex-stats";
    stats.appendChild(statNode("wpm", 0));
    stats.appendChild(statNode("acc", "100%"));
    stats.appendChild(statNode("err", 0));
    stats.appendChild(statNode("left", "0s"));
    hud.append(presets, settings, stats);
  }
  function statNode(label, value) {
    const node = document.createElement("span");
    node.className = "cotypex-stat";
    const name = document.createElement("span");
    name.className = "cotypex-stat-name";
    name.textContent = label;
    const number = document.createElement("span");
    number.className = "cotypex-stat-value";
    number.textContent = String(value);
    node.append(name, number);
    return node;
  }
  function updateStatNode(node, label, value) {
    if (!(node instanceof Element)) return;
    const name = node.querySelector(".cotypex-stat-name");
    const number = node.querySelector(".cotypex-stat-value");
    if (name) name.textContent = String(label);
    if (number) number.textContent = String(value);
  }
  function resultMetric(label, value) {
    const node = document.createElement("span");
    node.className = "cotypex-result-metric";
    node.append(statNode(label, value));
    return node;
  }
  function progressLabel(metrics, preset) {
    if (preset.mode === "time") return `${Math.ceil((metrics.remainingMs ?? preset.limit * 1e3) / 1e3)}s`;
    return `${Math.round(metrics.progress * 100)}%`;
  }
  function presetFor(id) {
    return PRESETS.find((preset) => preset.id === id) ?? PRESETS[2];
  }
  function quoteCorpus(language = "typescript") {
    const source = CORPUS && typeof CORPUS === "object" ? CORPUS[language] : null;
    if (Array.isArray(source) && source.length > 0) return source;
    return Array.isArray(CORPUS?.typescript) ? CORPUS.typescript : [];
  }
  function wordCount(value) {
    return String(value).trim().split(/\s+/).filter(Boolean).length;
  }
  function randomIndex(length) {
    if (length <= 1) return 0;
    return crypto.getRandomValues(new Uint32Array(1))[0] % length;
  }
  function chromePalette(color) {
    const rgb = parseRgb(color);
    const lightText = rgb ? relativeLuminance(rgb) > 0.55 : true;
    if (lightText) {
      return {
        fg: "rgba(238, 242, 240, 0.88)",
        muted: "rgba(238, 242, 240, 0.58)",
        strong: "#ffffff",
        panel: "rgba(18, 21, 22, 0.86)",
        active: "rgba(255, 255, 255, 0.14)",
        border: "rgba(255, 255, 255, 0.12)",
        focus: "rgba(255, 255, 255, 0.34)"
      };
    }
    return {
      fg: "rgba(26, 31, 32, 0.86)",
      muted: "rgba(26, 31, 32, 0.58)",
      strong: "#111516",
      panel: "rgba(255, 255, 255, 0.88)",
      active: "rgba(0, 0, 0, 0.08)",
      border: "rgba(0, 0, 0, 0.10)",
      focus: "rgba(0, 0, 0, 0.28)"
    };
  }
  function parseRgb(color) {
    const match = String(color).match(/rgba?\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)/);
    if (!match) return null;
    return [Number(match[1]), Number(match[2]), Number(match[3])];
  }
  function relativeLuminance([red, green, blue]) {
    const [r, g, b] = [red, green, blue].map((channel) => {
      const value = channel / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
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
  function findComposerSurface(editor) {
    return editor.closest(".composer-surface-chrome, form, [data-testid*='composer'], [class*='composer']") ?? editor.parentElement ?? document.body;
  }
  function directChildContaining(container, descendant) {
    let branch = descendant;
    while (branch?.parentElement && branch.parentElement !== container) {
      branch = branch.parentElement;
    }
    return branch?.parentElement === container ? branch : null;
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
  function captureInlineStyles(element, properties) {
    if (!element) return null;
    return Object.fromEntries(properties.map((property) => [property, element.style[property] ?? ""]));
  }
  function restoreInlineStyles(element, saved) {
    if (!element || !saved) return;
    for (const [property, value] of Object.entries(saved)) {
      element.style[property] = value;
    }
  }
  function appendTransition(existing, addition) {
    const value = String(existing ?? "").trim();
    if (!value) return addition;
    return value.includes(addition) ? value : `${value}, ${addition}`;
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
        color: resolveEditorColor(computed)
      }
    };
  }
  function resolveEditorColor(computed) {
    const bodyColor = document.body ? getComputedStyle(document.body).color : "";
    for (const color of [computed.color, computed.caretColor, bodyColor]) {
      if (isVisibleCssColor(color)) return color;
    }
    return "rgb(238, 242, 240)";
  }
  function isVisibleCssColor(color) {
    const value = String(color ?? "").trim();
    if (!value || value === "auto" || value === "transparent") return false;
    const alpha = value.match(/rgba?\([^/]*[,/]\s*(0(?:\.0+)?|\.0+)\s*\)$/)?.[1];
    return alpha === void 0;
  }
  function readEditorText(editor) {
    if (isTextControl(editor)) return editor.value;
    if (editor.matches(".ProseMirror")) {
      return Array.from(editor.childNodes, serializeEditorBlock).join("\n");
    }
    return editor.textContent ?? "";
  }
  function serializeEditorBlock(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue ?? "";
    if (!(node instanceof Element)) return "";
    if (node.tagName === "BR") return "\n";
    if (node.childNodes.length === 1 && node.firstChild instanceof HTMLBRElement) return "";
    return Array.from(node.childNodes, serializeEditorBlock).join("");
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
  function selectPrompt(previousIndex, language = "typescript") {
    const corpus = quoteCorpus(language);
    if (corpus.length === 0) throw new Error("CoTypeX corpus must not be empty");
    if (corpus.length === 1) return corpus[0];
    const random = randomIndex(corpus.length);
    const index = random === previousIndex ? (random + 1) % corpus.length : random;
    return corpus[index];
  }
})();
