# Layer 1 — AIL Compiler (spec-complete, implementation-stubbed)

This tree is **specified but not yet implemented**. It exists so contributors have a
landing pad and so the two-layer architecture (ADR-0006) is legible from the file
tree. Layer 0 (`../skill/`) ships without any of this.

## The 15-pass pipeline (ADR-0002)

| Stage | Passes |
|-------|--------|
| Front-end -> SG | 001 Lexing · 002 Parsing · 003 Normalization · 004 Macro Expansion · 005 Name Resolution · 006 Semantic Binding |
| Middle-end (annotates SG) | 007 Type Checking · 008 Capability Resolution · 009 Constraint Resolution · 010 Audited Optimization |
| Back-end -> AIR | 011 EPI Lowering · 012 Control-Flow Expansion · 013 Verification · 014 AIR Lowering · 015 ARE Emission |

## Where implementations land

- [`ts/`](ts/) — reference TypeScript compiler.
- [`rust/`](rust/) — high-performance Rust engine.

Both MUST reproduce the byte-identical canonical AIR hash for
`../tests/golden/extract-basic/` (RFC-009, RFC-012). The golden fixtures are the
behavioral contract; implement against them, do not redefine them.

## Recommended build order (from the reviews)

Golden harness first, then Lexer (001) -> Parser (002) -> Semantic Binder (006) ->
EPI (011) -> AIR (014). Do not implement the semantic graph or AIR until the
lexer+parser boundary is stable against the fixtures.
