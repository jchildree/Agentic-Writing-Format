# ADR-0002 — Canonical 15-Pass Pipeline

**Status:** Accepted
**Date:** 2026-07-17
**Supersedes:** all pass numbering in the prior corpus (Technical Review, AIL v1.0
Standard, Release Gate, Final Contract Refactorings, RFC draft).

## Context

`PASS-010` meant three different things across documents (Audited Optimization,
Primitive Lowering, EPI Lowering); `AIR Lowering` floated between 011 and 012;
control-flow was a fractional `PASS-010.2`. Every diagnostic, fixture, and node ID
references a pass, so nothing downstream could be frozen.

## Decision

One pipeline, three stages, every responsibility a stable number. **Never renumber
again.**

| Stage | Pass | Name |
|-------|------|------|
| Front-end | 001 | Lexing |
| | 002 | Parsing |
| | 003 | Normalization (block-form -> canonical desugar) |
| | 004 | Macro Expansion |
| | 005 | Name Resolution |
| | 006 | Semantic Binding (builds SG; freeze boundary) |
| Middle-end | 007 | Type Checking |
| | 008 | Capability Resolution |
| | 009 | Constraint Resolution |
| | 010 | Audited Optimization |
| Back-end | 011 | EPI Lowering |
| | 012 | Control-Flow Expansion |
| | 013 | Verification |
| | 014 | AIR Lowering |
| | 015 | ARE Emission |

**Runtime Happy Path (Layer 0 / Lenient):** subset {001, 002, 003, 005, 006, 009},
terminating in direct execution — never optimization, EPI, AIR, or ARE.

## Consequences

- (+) Single referent for every pass; the SG-freeze boundary (end of 006) is preserved.
- (+) The prior "frozen PASS-006 front-end" claim survives intact under new numbers.
- (-) One-time churn: every pass reference in the corpus rewrites to these numbers.
- (-) The fractional `PASS-010.2` is retired (now PASS-012).
