# ADR-0006 — Spec-First, Layer-Partitioned Monorepo

**Status:** Accepted
**Date:** 2026-07-17
**Supersedes:** the three competing layouts (RFC `ail-ecosystem/`, docs-only export,
`packages/` sketch).

## Context

The corpus proposed three incompatible repo layouts, and the repository is named
`Agentic-Writing-Format` — Layer 0's name, not AIL's. A layout has to make the
two-layer architecture legible while keeping the shared golden fixtures in one place.

## Decision

One repo, named for Layer 0. Normative spec + ADRs + RFCs at the root of authority;
`/skill` holds Layer 0 (source + generated adapters); `/compiler` holds Layer 1,
spec-complete but implementation-stubbed (folders + READMEs mark where TS/Rust land);
`/tests/golden` is the single shared fixture home both layers cite.

## Consequences

- (+) The layered architecture is legible from the file tree alone.
- (+) Golden fixtures live in exactly one place — no more self-contradicting copies.
- (-) A near-empty `/compiler` ships before any compiler exists.
- **Parked:** splitting Layer 1 into its own repo as a v2 option if it outgrows the monorepo.
