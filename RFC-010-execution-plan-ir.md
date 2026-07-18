# RFC-010 — Execution Plan IR & Workflow Semantics

**Status:** Draft (v1.0.0) · **Layer:** 1 (PASS-011 / PASS-012)

## EPI
The Execution Plan IR is a strict DAG lowered from the SG. **PASS-011** produces
primitive `STEP` nodes (1:1 with semantic operations) and explicit dependency edges
only — no retries, branches, or fan-out. **PASS-012** injects control-flow wrappers
(`SEQUENCE`, `PARALLEL`, `BRANCH`, `RETRY`) as a graph transformation over the
primitive EPI, without touching the frozen SG.

## Invariants (PASS-013 checks)
Unique node ids (`AIL-EPI-001`), acyclicity (`AIL-EPI-002`), rooted entryPoint
(`AIL-EPI-003`), edge integrity (`AIL-EPI-004`), capability binding (`AIL-EPI-005`).
`entryPoint` is the lexically-first topological root.
