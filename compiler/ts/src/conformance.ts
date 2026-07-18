import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { compile } from "./pipeline";
import { RCD } from "./types";

const GOLDEN = path.resolve(__dirname, "../../../tests/golden/extract-basic");
const EXPECTED = "f20f4ba7cb26a7408ea51d3a48e447d7d98160567199f9bae6b4617a7ee4fb7a";

function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj !== null && typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(obj as Record<string, unknown>).sort()) {
      out[k] = sortKeys((obj as Record<string, unknown>)[k]);
    }
    return out;
  }
  return obj;
}

function canonicalHash(obj: unknown): string {
  const bytes = Buffer.from(JSON.stringify(sortKeys(obj)), "utf8");
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

const source = fs.readFileSync(path.join(GOLDEN, "input.awf"), "utf8");
const rcd: RCD = JSON.parse(fs.readFileSync(path.join(GOLDEN, "rcd.json"), "utf8"));

const air = compile(source, rcd);
const hash = canonicalHash(air);

if (hash === EXPECTED) {
  console.log("PASS", hash);
  process.exit(0);
} else {
  console.error("FAIL");
  console.error("  expected:", EXPECTED);
  console.error("  got:     ", hash);
  console.error(JSON.stringify(air, null, 2));
  process.exit(1);
}
