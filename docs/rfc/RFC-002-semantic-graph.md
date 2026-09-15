# RFC-002 — Semantic Graph Architecture & Node Types

**Status:** Draft (v1.0.0) · **Layer:** 0/1 boundary (built at PASS-006)

## Nodes
`Action`, `Resource`, `Modifier`, `Constraint`, `Output`. Each carries
`id`, `kind`, `symbolId`, `attributes` (sorted keys), `location`.

## Edges
`TARGETS`, `HAS_MODIFIER`, `HAS_CONSTRAINT`, `PRODUCES`.

## Identity
`kind.symbolId.startLine.startColumn` (ADR-0003). Nodes sort by `id`; edges sort by
`(from, to, type)`; attribute keys sort ASCII.

## Freeze boundary
The SG is frozen at the end of PASS-006. The middle-end (007-010) annotates it but
MUST NOT mutate its topology. Schema:
[`../../spec/schemas/semantic-graph-v1.0.0.schema.json`](../../spec/schemas/semantic-graph-v1.0.0.schema.json).
The SG may be cyclic in principle; runtime ordering is deferred to the EPI (RFC-010).
