# RFC-003 — Type System & Semantic Categories

**Status:** Draft (v1.0.0) · **Layer:** 0/1 (shared core)

## Semantic categories
`IntentType`, `EntityType`, `ModifierType`, `ConstraintType`, `CapabilityType`,
`ContractType`.

## Hybrid-core lexicon (ADR-0001)
- **Core Operator Set** — closed, versioned, reserved; lexes as `KEYWORD`. See
  [`../../spec/lexicon/core-operators.json`](../../spec/lexicon/core-operators.json).
- **Extension Operators** — open; lex as `IDENTIFIER`. Strict emits `AIL-NAME-001`
  (warning); Lenient consults
  [`../../spec/lexicon/advisory.json`](../../spec/lexicon/advisory.json).

PASS-007 Type Checking enforces category safety over the frozen SG.
