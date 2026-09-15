# RFC-009 — Conformance Suite

**Status:** Draft (v1.0.0) · **Layer:** 0/1 (behavioral contract)

## Golden harness
Each pipeline boundary has a frozen snapshot: `input.awf` -> `tokens.json` (001) ->
`ast.json` (002) -> `semantic.graph.json` (006) -> `execution.plan.json` (011) ->
`air.json` (014), plus `diagnostics.json` and `manifest.json`. See
[`../../tests/golden/extract-basic/`](../../tests/golden/extract-basic/).

## Conformance rule
A compiler is conformant iff, for identical `input.awf` + RCD, it reproduces the
byte-identical canonical AIR hash (RFC-012). Negative fixtures assert exact
diagnostic output. Failure behavior is as much a part of the contract as success.

## Note on RFC-014 / RFC-015
Review-era references to "RFC-014" and "RFC-015" never existed in the numbered
suite; their conformance content is folded into this RFC to close the mismatch.
