import { compile } from "./pipeline";
import { RCD } from "./types";

// Regression check for STRING/NUMBER/NEWLINE token support in PASS-001 (RFC-001):
// a quoted-string modifier value and a bare-number modifier value must survive
// lexing/parsing/binding and reach the AIR execution step unchanged, with no
// diagnostics, rather than being silently dropped.

const rcd: RCD = {
  runtimeId: "smoke",
  capabilities: [{ id: "cap.extract", version: "1.0.0", operations: ["AIL.OP.EXTRACT"] }],
};

const source = 'Extract SystemLogs -> Depth:"deep scan" Limit:42 | P1 Lock:RawJSON => JSON';

const air = compile(source, rcd);
const failures: string[] = [];

if (air.diagnostics.length !== 0) {
  failures.push(`expected no diagnostics, got ${JSON.stringify(air.diagnostics)}`);
}

const modifiers = air.execution_pipeline[0]?.modifiers ?? {};
if (modifiers.depth !== "deep scan") {
  failures.push(`expected modifiers.depth === "deep scan", got ${JSON.stringify(modifiers.depth)}`);
}
if (modifiers.limit !== "42") {
  failures.push(`expected modifiers.limit === "42", got ${JSON.stringify(modifiers.limit)}`);
}

if (failures.length === 0) {
  console.log("PASS smoke: STRING/NUMBER modifier values");
  process.exit(0);
} else {
  console.error("FAIL smoke: STRING/NUMBER modifier values");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
