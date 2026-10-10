# ADR-0001 — Hybrid-Core Operator Lexicon

**Status:** Accepted
**Date:** 2026-07-17

## Context

The source corpus carried four unreconciled word lists (a "punch-per-token" set,
the AWF lexicon tables, an ACF verb hierarchy, and the compiler's
`STANDARD_OPERATORS`). Two incompatible models were tangled: a *closed* set of
reserved operators the grammar type-checks, and an *open* graded vocabulary. A
closed set caps the "universal, any agent" promise; a fully open set removes the
compiler's ability to hard-error on unknown operators. The downstream symptom was a
lexer in which every word tokenized as `IDENTIFIER`.

## Decision

AWF defines a **closed, versioned Core Operator Set** with normative semantics and
reserved-keyword status. All other operators are valid **Extension Operators** with
no normative guarantee.

- Lexer emits `KEYWORD` for Core, `IDENTIFIER` for everything else.
- **Strict/Compiler** profile compiles Extension Operators with an `AIL-NAME-001`
  warning (not a halt).
- **Lenient/Runtime** profile interprets Extension Operators via the advisory lexicon.
- Core Set membership is itself versioned; changing it is ADR-gated.

## Consequences

- (+) Deterministic core for the compiler; genuinely open vocabulary for the skill.
- (+) Token ambiguity resolved: Core = `KEYWORD`, Extension = `IDENTIFIER`.
- (+) Layer 0 and Layer 1 remain two readers of one lexicon.
- (-) The spec must everywhere distinguish **Core Operator** from **Extension
  Operator**; bare "operator" is banned as imprecise.
- (-) Hard to reverse: golden fixtures and diagnostic semantics bake it in.
- **Retires** the legacy `AIL001` "halt on unknown operator" behavior.
