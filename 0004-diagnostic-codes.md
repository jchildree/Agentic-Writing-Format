# ADR-0004 — Phase-Prefixed Diagnostic Codes

**Status:** Accepted
**Date:** 2026-07-17
**Supersedes:** the `AIL###`, `EPI###`, `AIL-SYM-###`, `AIL-PARSE-###` schemes.

## Context

Diagnostic codes forked four ways for the same failures. Every negative fixture
(`diagnostics.json`) was unfreezable until there was one scheme, and the fuzzy
boundary between the families (is a name-resolution failure `AIL` or `EPI`?) is how
four schemes bred.

## Decision

Codes are `AIL-<PHASE>-<NNN>`, zero-padded, per-phase append-only, mapped 1:1 onto
the ADR-0002 pipeline. Phase abbreviations: `LEX PARSE NORM MACRO NAME SEM TYPE CAP
CON OPT EPI FLOW VERIFY AIR ARE`. `severity`, `location`, and `recovery` remain
payload fields, never encoded in the code. The full migration map from legacy codes
lives in [`../../spec/diagnostics/registry.json`](../../spec/diagnostics/registry.json).

## Consequences

- (+) Every code self-locates to the pass that emitted it; fixtures become readable.
- (+) Absorbs all four legacy schemes with mechanical reprefixing.
- (-) Requires the normative phase-abbreviation table above.
- **Interaction (loud):** `AIL001`'s "halt on unknown operator" is retired by ADR-0001;
  the unregistered-operator case is now the warning `AIL-NAME-001`.
