# ADR-0005 — Single Normative Skill Source -> Generated Per-Runtime Adapters

**Status:** Accepted
**Date:** 2026-07-17
**Unifies:** the three skill formats in the corpus (Claude `SKILL.md` frontmatter,
`<agent_skill>` XML, AGENTS.md prose).

## Context

Layer 0's whole value is being "universal, any agent," but the corpus fragmented its
delivery three ways. Hand-maintained per-vendor skill files drift the moment one is
edited and the others are not — the same failure mode that produced two contradictory
golden fixtures.

## Decision

Layer 0 is authored **once** as a runtime-neutral normative source
(`skill/skill.source.md`). Vendor shims (Claude, OpenAI, Gemini, generic AGENTS.md)
are **generated** from that source via `skill/generate.py`, never hand-edited. Each
adapter carries a provenance header: `generated from skill/skill.source.md@<hash> -
do not edit`. A shim is valid only if it round-trips the source's directives
(*adapter conformance*).

## Consequences

- (+) "Any agent" is honest *and* idiomatic per platform.
- (+) Adapters cannot drift — they compile from one source.
- (+) Consolidates three competing formats into one lineage.
- (-) We maintain a source doc + adapter templates + a small generator.
