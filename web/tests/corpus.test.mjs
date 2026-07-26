import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const corpus = JSON.parse(
  await readFile(new URL("../src/corpus.json", import.meta.url), "utf8"),
);

const languages = [
  "javascript",
  "typescript",
  "python",
  "java",
  "go",
  "rust",
  "sql",
  "csharp",
  "php",
];

test("corpus covers popular programming languages", () => {
  assert.deepEqual(Object.keys(corpus), languages);
  for (const language of languages) {
    assert.ok(corpus[language].length >= 3, `${language} needs at least three snippets`);
  }
});

test("every business snippet is multiline and substantial", () => {
  for (const [language, snippets] of Object.entries(corpus)) {
    for (const snippet of snippets) {
      assert.match(snippet, /\n/, `${language} snippet should be multiline`);
      assert.ok(snippet.length >= 80, `${language} snippet is too short`);
    }
  }
});
