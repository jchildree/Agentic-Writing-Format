# ADR-0003 — Content-Stable, Position-Derived Node Identity

**Status:** Accepted
**Date:** 2026-07-17
**Resolves:** the contradictory `tests/golden/extract-basic/semantic.graph.json`.

## Context

The "frozen" golden fixture existed in two incompatible forms — position-derived IDs
(`Action.AIL.OP.EXTRACT.1.1`) versus monotonic counters (`NODE.ACTION.001`) — with
divergent column numbers. Node identity is the hinge that RFC-012's cross-language
SHA-256 promise swings on; a counter scheme is deterministic only if traversal order
is *also* made normative — the exact coupling that spawned the contradiction.

## Decision

Canonical node ID = `${kind}.${symbolId}.${startLine}.${startColumn}`
(e.g. `Action.AIL.OP.EXTRACT.1.1`). Order-independent by construction. Duplicate
identical directives on one line disambiguate with a trailing `.N` ordinal. The
monotonic-counter fixture is **retired**; one canonical `input.awf` with one
authoritative column map is the sole fixture.

## Consequences

- (+) "Identical input -> byte-identical AIR across TS/Python/Rust" is honest without
  a normative traversal order.
- (-) IDs shift under source reformatting — acceptable, since RFC-012 promises only
  *identical input -> identical output*.
- **Parked:** content-hash, position-independent IDs (stable under reformatting) as a
  possible v1.1 evolution if position-brittleness bites.
