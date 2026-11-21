import * as fs from "fs";
import * as path from "path";
import { compile } from "./pipeline";
import { canonicalHash } from "./canonical";
import { RCD } from "./types";

// RFC-009 conformance: the golden fixture must hash byte-for-byte to the frozen value.

const GOLDEN = path.resolve(__dirname, "../../../tests/golden/extract-basic");
const EXPECTED = fs.readFileSync(path.join(GOLDEN, "air.sha256"), "utf8").trim().split(/\s+/)[0];

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
