# RFC-001 — AWF Syntax & Grammar

**Status:** Draft (v1.0.0) · **Layer:** 0 (shared core)

## Normative surface
The single-line **operator form** is canonical:
`Operator Target -> Modifiers | Constraints => Output`. Full grammar:
[`../../spec/grammar/awf.ebnf`](../../spec/grammar/awf.ebnf).

## Column convention (normative)
1-indexed. Token spans are half-open `[startColumn, endColumn)`, so
`endColumn = startColumn + length`. EOF is a cursor: `startColumn == endColumn`.

## Token classes
`KEYWORD` (Core Operators, per RFC-003), `IDENTIFIER`, `ARROW` (`->`), `PIPE` (`|`),
`COLON` (`:`), `OUTPUT_ARROW` (`=>`), `PRIORITY` (`P1`..`P5`), `STRING`, `NUMBER`,
`NEWLINE`, `EOF`.

## Appendix A — Block form (provisional)
The multi-line `<System>` / `Key: value` layout is **non-normative sugar** in v1.0.
PASS-003 Normalization desugars it into canonical operator form before parsing;
until the full key->operator mapping is frozen, block form carries no conformance
guarantee. Decided in ADR-0002 (PASS-003) and the surface-syntax grill.
