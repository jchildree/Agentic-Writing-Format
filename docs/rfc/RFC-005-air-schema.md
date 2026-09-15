# RFC-005 — Immutable AIR Schema

**Status:** Draft (v1.0.0) · **Layer:** 1 (PASS-014 output)

AIR is the immutable canonical execution IR — the single source of truth across
backends. Schema:
[`../../spec/schemas/air-v1.0.0.schema.json`](../../spec/schemas/air-v1.0.0.schema.json).
Required top-level keys: `$schema`, `version`, `capabilities_required`,
`execution_pipeline`, `constraints`, `output_contract`, `diagnostics`. `version` is
frozen at `"1.0"`. AIR is serialized under RFC-012 for byte reproducibility.
