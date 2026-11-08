# AIL Reference Compiler -- TypeScript

Reference implementation of the 15-pass AWF compiler (RFC-009, RFC-012), with an
`awf` command-line tool.

## Setup

```bash
npm install
npm test              # build + 20 unit/golden tests
npm run conformance   # PASS f20f4ba7cb26a7408ea51d3a48e447d7d98160567199f9bae6b4617a7ee4fb7a
```

## The `awf` CLI

```bash
node dist/cli.js compile ../../examples/exec-brief.awf                 # -> AIR JSON
node dist/cli.js compile ../../examples/exec-brief.awf --emit claude   # -> Claude Messages payload
node dist/cli.js compile input.awf --stage sg                          # tokens | ast | sg | epi | air
node dist/cli.js check ../../examples/*.awf                            # diagnostics only, exit 1 on errors
node dist/cli.js hash ../../tests/golden/extract-basic/air.json        # RFC-012 canonical SHA-256
echo 'Summarize Doc -> Length:Short => Markdown' | node dist/cli.js compile - --emit openai
```

`npm link` installs it as plain `awf`. Diagnostics go to stderr with a source excerpt;
output JSON goes to stdout (or `--out <file>`). Exit codes: `0` ok, `1` compile errors,
`2` usage errors. Set `NO_COLOR=1` to turn colors off.

`--rcd <path>` picks the Runtime Capability Descriptor. The default,
[`rcd/default.rcd.json`](rcd/default.rcd.json), covers all 16 Core Actions. Extension
Operators (e.g. `Brainstorm`) need an RCD that lists `AIL.OP.BRAINSTORM`, or they fail
with `AIL-CAP-003`.

## Library API

```ts
import { compileDetailed, compile, compileAndEmit } from "./dist/pipeline";

const result = compileDetailed(source, rcd);  // { ok, diagnostics, tokens, ast, sg, epi, air }
const air = compile(source, rcd);             // just the AIR
const payload = compileAndEmit(source, rcd, "claude"); // throws if AIR carries errors (RFC-007)
```

The pipeline never throws on bad input. Lex and parse errors become diagnostics, the
parser skips the broken line, and the remaining statements still compile, so one run
reports everything it can.

## Pass status

| Pass | Status |
|------|--------|
| 001 Lex | Done: keywords, identifiers, `"strings"` with `\"` escapes, numbers, `P1`..`P5`; `AIL-LEX-001` |
| 002 Parse | Done: full `awf.ebnf` statement form, per-line error recovery; `AIL-PARSE-002/003` |
| 003 Normalize | Detects block form, warns `AIL-NORM-001` (mapping not frozen, RFC-001 App. A) |
| 004 Macro | No-op: RFC-008 defines no stdlib macros yet |
| 005 Name | Extension operators `AIL-NAME-001`, duplicate resources `AIL-NAME-002` |
| 006 Bind | Done (SG-freeze) |
| 007 Type | Required-edge checks `AIL-TYPE-001` |
| 008 Capability | RCD resolution `AIL-CAP-003` |
| 009 Constraint | Priority conflicts `AIL-CON-004` |
| 010 Optimize | No-op: no audited rewrites are registered |
| 011 EPI | Done, RFC-006 lexical tie-break |
| 012 Control flow | No-op: the v1 grammar has no control-flow syntax |
| 013 Verify | DAG, ids, entry point `AIL-EPI-001..004` |
| 014 AIR | Done; mixed output formats warn `AIL-AIR-001` |
| 015 ARE | `claude`, `openai`, `gemini`, `generic`; refuses AIR with errors |

## Known AIR v1 limits

AIR v1 has one program-wide output contract and program-wide constraints. In a
multi-statement file the first statement's output format wins (with `AIL-AIR-001`), and
the emitted directive repeats every constraint on every step. Fixing that is an AIR schema
change and needs an RFC-005 revision.

## Source layout

```
src/types.ts             shared types for all passes
src/lexicon.ts           closed Core Lexicon (mirrors core-operators.json)
src/diagnostics.ts       diagnostic helpers + RFC-011 ordering
src/canonical.ts         RFC-012 canonical JSON + SHA-256 (matches canonicalize.py)
src/pass0NN-*.ts         one file per pass
src/pipeline.ts          compileDetailed / compile / compileAndEmit
src/cli.ts               the `awf` command
src/conformance.ts       golden fixture hash check
src/test/                node:test suite
rcd/default.rcd.json     default Runtime Capability Descriptor
```
