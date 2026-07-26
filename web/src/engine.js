export function splitCharacters(value) {
  return Array.from(String(value ?? "").normalize("NFC"));
}
export function createSession(targetText, now = 0) {
  const target = splitCharacters(targetText);
  if (target.length === 0) throw new Error("target text must not be empty");
  return {
    target,
    typed: [],
    startedAt: null,
    updatedAt: now,
    completedAt: null,
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
  const complete = next.length === session.target.length
    && next.every((character, index) => character === session.target[index]);

  return {
    ...session,
    typed: next,
    startedAt,
    updatedAt: now,
    completedAt: complete ? (session.completedAt ?? now) : null,
    keystrokes,
    errors,
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
  return {
    elapsedMs,
    correctPositions,
    progress: correctPositions / session.target.length,
    wpm: Math.round((correctPositions / 5) / minutes),
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
