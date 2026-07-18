# AIL Reference Compiler -- TypeScript

Reference implementation of the 15-pass AWF compiler (RFC-009, RFC-012).

## Status

Passes 001 (Lex), 002 (Parse), 003 (Normalize), 006 (Semantic Bind), 011 (EPI Lower), 014 (AIR Lower), 015 (ARE Emit) are implemented. Conformance verified against the golden fixture hash.

Passes 004 (Macro), 005 (Name Resolution), 007-010 (middle-end), 012-013 (CF + Verify) are stubbed.

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
