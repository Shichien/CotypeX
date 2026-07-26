import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const here = path.dirname(fileURLToPath(import.meta.url));
const css = await fs.readFile(path.join(here, "src", "styles.css"), "utf8");
const corpus = JSON.parse(await fs.readFile(path.join(here, "src", "corpus.json"), "utf8"));
const output = path.resolve(here, "..", "dist", "cotypex.user.js");

await fs.mkdir(path.dirname(output), { recursive: true });
await build({
  entryPoints: [path.join(here, "src", "index.js")],
  outfile: output,
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "chrome120",
  legalComments: "none",
  banner: {
    js: "/* CoTypeX 0.4.2 - shared standalone and Codex++ user script */",
  },
  plugins: [{
    name: "cotypex-assets",
    setup(builder) {
      builder.onResolve({ filter: /^virtual:cotypex-assets$/ }, () => ({
        path: "cotypex-assets",
        namespace: "cotypex",
      }));
      builder.onLoad({ filter: /.*/, namespace: "cotypex" }, () => ({
        contents: `export const CSS_TEXT = ${JSON.stringify(css)};\nexport const CORPUS = ${JSON.stringify(corpus)};`,
        loader: "js",
      }));
    },
  }],
});

console.log(`Built ${output}`);
