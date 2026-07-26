export function splitCharacters(value) {
  return Array.from(String(value ?? "").normalize("NFC"));
}

export function createSession(targetText, now = 0, options = {}) {
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
    errors: 0,
  };
}

export function updateSession(session, nextValue, now = Date.now()) {
  const next = splitCharacters(nextValue).slice(0, session.target.length);
  const previous = session.typed;
  const common = commonPrefixLength(previous, next);
  let keystrokes = session.keystrokes;
  let errors = session.errors;

  if (next.length > common) {
    for (let index = common; index < next.length; index += 1) {
      keystrokes += 1;
      if (next[index] !== session.target[index]) errors += 1;
    }
  }

  const startedAt = session.startedAt ?? (next.length > 0 ? now : null);
  const targetComplete = next.length === session.target.length
    && next.every((character, index) => character === session.target[index]);
  const timeComplete = isTimedOut({ ...session, startedAt }, now);
  const complete = targetComplete || timeComplete;

  return {
    ...session,
    typed: next,
    startedAt,
    updatedAt: now,
    completedAt: complete ? (session.completedAt ?? now) : null,
    completedReason: complete
      ? (session.completedReason ?? (timeComplete ? "time" : "target"))
      : null,
    keystrokes,
    errors,
  };
}

export function refreshSession(session, now = Date.now()) {
  if (session.completedAt !== null || !isTimedOut(session, now)) {
    return { ...session, updatedAt: now };
  }
  return {
    ...session,
    updatedAt: now,
    completedAt: now,
    completedReason: "time",
  };
}

export function sessionMetrics(session, now = Date.now()) {
  const elapsedMs = session.startedAt === null
    ? 0
    : Math.max(0, (session.completedAt ?? now) - session.startedAt);
  const correctPositions = session.typed.reduce(
    (total, character, index) => total + Number(character === session.target[index]),
    0,
  );
  const minutes = Math.max(elapsedMs / 60000, 1 / 60);
  const accuracy = session.keystrokes === 0
    ? 100
    : Math.max(0, ((session.keystrokes - session.errors) / session.keystrokes) * 100);
  const remainingMs = session.mode === "time" && Number.isFinite(session.limit)
    ? Math.max(0, session.limit * 1000 - elapsedMs)
    : null;
  const incorrectPositions = session.typed.reduce(
    (total, character, index) => total + Number(character !== session.target[index]),
    0,
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
    wpm: Math.round((correctPositions / 5) / minutes),
    rawWpm: Math.round((session.typed.length / 5) / minutes),
    accuracy: Math.round(accuracy),
    complete: session.completedAt !== null,
  };
}

export function characterState(session, index) {
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
  return session.mode === "time"
    && Number.isFinite(session.limit)
    && session.startedAt !== null
    && now - session.startedAt >= session.limit * 1000;
}
