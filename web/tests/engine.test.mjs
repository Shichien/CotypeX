import test from "node:test";
import assert from "node:assert/strict";

import {
  characterState,
  createSession,
  refreshSession,
  sessionMetrics,
  splitCharacters,
  updateSession,
} from "../src/engine.js";

test("splitCharacters keeps a Chinese character as one unit", () => {
  assert.deepEqual(splitCharacters("打字"), ["打", "字"]);
});

test("session completes only when every character matches", () => {
  let session = createSession("code", 0);
  session = updateSession(session, "coda", 1000);
  assert.equal(session.completedAt, null);
  assert.equal(characterState(session, 3), "incorrect");
  session = updateSession(session, "cod", 1500);
  session = updateSession(session, "code", 2000);
  assert.equal(session.completedAt, 2000);
});

test("backspace does not erase historical mistakes", () => {
  let session = createSession("abc", 0);
  session = updateSession(session, "ax", 1000);
  session = updateSession(session, "a", 1500);
  session = updateSession(session, "ab", 2000);
  assert.equal(session.errors, 1);
  assert.equal(session.keystrokes, 3);
  assert.equal(sessionMetrics(session, 2000).accuracy, 67);
});

test("metrics use five characters per word", () => {
  let session = createSession("abcdefghij", 0);
  session = updateSession(session, "a", 0);
  session = updateSession(session, "abcdefghij", 6000);
  assert.equal(sessionMetrics(session).wpm, 20);
});

test("timed sessions complete when the limit elapses", () => {
  let session = createSession("abcdefghijklmnopqrstuvwxyz", 0, { mode: "time", limit: 2 });
  session = updateSession(session, "abcde", 1000);
  session = refreshSession(session, 2999);
  assert.equal(session.completedAt, null);
  session = refreshSession(session, 3000);
  assert.equal(session.completedAt, 3000);
  assert.equal(session.completedReason, "time");
});

test("metrics include raw speed and remaining time", () => {
  let session = createSession("abcde", 0, { mode: "time", limit: 10 });
  session = updateSession(session, "axc", 0);
  const metrics = sessionMetrics(session, 3000);
  assert.equal(metrics.rawWpm, 12);
  assert.equal(metrics.incorrectPositions, 1);
  assert.equal(metrics.remainingMs, 7000);
});
