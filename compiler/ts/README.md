# AIL Reference Compiler -- TypeScript

Reference implementation of the 15-pass AWF compiler (RFC-009, RFC-012).

## Status

Passes 001 (Lex), 002 (Parse), 003 (Normalize), 005 (Name Resolution), 006 (Semantic Bind), 007 (Type Check), 008 (Capability Resolution), 009 (Constraint Resolution), 011 (EPI Lower), 013 (Verification), 014 (AIR Lower), 015 (ARE Emit) are implemented. Conformance verified against the golden fixture hash.

Passes 004 (Macro), 010 (Audited Optimization), 012 (Control-Flow) are stubbed — see the note below.

**Known gaps not yet covered by the golden fixture:**
- The lexer (PASS-001) only tokenizes `KEYWORD`/`IDENTIFIER`/structural symbols. RFC-001 also specifies `STRING`, `NUMBER`, and `NEWLINE` token classes; none are implemented, so a modifier or constraint value that isn't an identifier (e.g. a bare number or quoted string) is silently dropped rather than lexed or rejected.
- PASS-004/010/012 are no-ops because nothing in the current grammar exercises them yet: there's no macro-invocation syntax for PASS-004 to expand (RFC-008), no concrete transformation catalog for PASS-010 to apply (RFC-004 defines the risk model but not transformations), and no settled default control-flow semantics for an ordinary multi-statement program for PASS-012 to inject (RFC-010 defines the wrapper node types but not when plain sequential statements get one). Each needs a spec decision before it can do real work, not just an implementation.

## Setup

```bash
npm install
npm run build
npm run conformance
```

Expected output: `PASS f20f4ba7cb26a7408ea51d3a48e447d7d98160567199f9bae6b4617a7ee4fb7a`

## Source layout

```
src/types.ts           shared TypeScript types for all passes
src/pass001-lex.ts     PASS-001 Lexer
src/pass002-parse.ts   PASS-002 Parser
src/pass003-normalize.ts  PASS-003 Normalize (canonical form; block form -> AIL-NORM-001)
src/pass006-bind.ts    PASS-006 Semantic Binder
src/pass011-epi.ts     PASS-011 EPI Lowering
src/pass014-air.ts     PASS-014 AIR Lowering
src/pass015-are.ts     PASS-015 ARE Emission (claude/openai/gemini/generic)
src/pipeline.ts        compile(source, rcd) -> AIR; compileAndEmit(...) -> AREPayload
src/conformance.ts     golden fixture hash check
```

See [`../README.md`](../README.md) for the full pass map.
