# AWF / AIL — Master Design Protocol (v1.0.0)

This is the map. Every normative claim links to the ADR that decided it and the
RFC that specifies it. Read top to bottom for the whole system; jump via the links
for a single concern.

- Terms: [`../CONTEXT.md`](../CONTEXT.md)
- Decisions: [`adr/`](adr/)
- Specifications: [`rfc/`](rfc/)

---

## 1. Purpose & the two-layer model

AWF replaces informal "prompt engineering" with a standard dense enough for a
compiler and readable enough for a human. It ships in two layers over **one**
normative spec (ADR-0001 established the shared-contract discipline that the rest
inherit):

- **Layer 0** — the authoring standard + a runtime-neutral Agent Skill. Any LLM
  loads it and speaks AWF today. No compiler.
- **Layer 1 (AIL)** — an optional deterministic compiler: `AWF -> AST -> SG -> EPI
  -> AIR -> provider payload`.

The dependency arrow points one way: **Layer 1 depends on Layer 0's spec; Layer 0
depends on nothing.** If the Skill ever needed the compiler to function, it would
not be Layer 0.

## 2. The one-contract seam

Both layers are **readers of a single spec**, not importers of each other's code:

- **Lenient (Runtime) profile** — the Skill. Tolerant: fills defaults, asks on a
  missing target, executes directly.
- **Strict (Compiler) profile** — the toolchain. Rejects ambiguity, emits AIR,
  hashes deterministically.

The spec separates a **normative core** (grammar, lexicon, semantics both profiles
must agree on) from **profile-specific behavior** (what each does with, say, a
missing target). Get that split wrong and the profiles fork the language; the spec
is organized around keeping it clean.

## 3. Canonical AWF — [RFC-001](rfc/RFC-001-awf-syntax-grammar.md)

The **single-line operator form** is normative:

```awf
Extract SystemLogs -> Depth:Critical | P1 Lock:RawJSON => JSON
```

Shape: `Operator Target -> Modifiers | Constraints => Output`. The multi-line
**block form** is provisional sugar for v1.0 and desugars into canonical form in
**PASS-003 Normalization** before the AST is built — so there is exactly one thing
to parse. Grammar: [`../spec/grammar/awf.ebnf`](../spec/grammar/awf.ebnf). Column
convention is normative: 1-indexed, half-open spans, `endColumn = startColumn + len`.

## 4. Hybrid-core lexicon — [ADR-0001](adr/0001-hybrid-core-lexicon.md), [RFC-003](rfc/RFC-003-type-system.md)

The lexicon is **hybrid-core**:

- **Core Operator Set** — closed, versioned, reserved. Lexes as `KEYWORD`, carries
  normative semantics. See [`../spec/lexicon/core-operators.json`](../spec/lexicon/core-operators.json).
- **Extension Operators** — everything else. Lexes as `IDENTIFIER`. Strict compiles
  them with an `AIL-NAME-001` **warning** (not a halt); Lenient interprets them via
  [`../spec/lexicon/advisory.json`](../spec/lexicon/advisory.json).

This resolves the old "everything is IDENTIFIER" ambiguity: Core = `KEYWORD`,
Extension = `IDENTIFIER`.

## 5. The 15-pass pipeline — [ADR-0002](adr/0002-canonical-pass-pipeline.md), [RFC-010](rfc/RFC-010-execution-plan-ir.md)

One pipeline, three stages, stable numbers, **never renumbered again**:

| Stage | Passes | Produces |
|-------|--------|----------|
| Front-end | 001 Lexing · 002 Parsing · 003 Normalization · 004 Macro Expansion · 005 Name Resolution · 006 Semantic Binding | Semantic Graph |
| Middle-end | 007 Type Checking · 008 Capability Resolution · 009 Constraint Resolution · 010 Audited Optimization | annotated SG |
| Back-end | 011 EPI Lowering · 012 Control-Flow Expansion · 013 Verification · 014 AIR Lowering · 015 ARE Emission | EPI -> AIR -> payload |

**Runtime Happy Path** (Layer 0 / Lenient): the reduced subset {001, 002, 003, 005,
006, 009}, terminating in direct execution — never EPI, AIR, or ARE. Same spine,
lower resolution.

## 6. Semantic Graph & node identity — [ADR-0003](adr/0003-node-identity.md), [RFC-002](rfc/RFC-002-semantic-graph.md)

The **Semantic Graph** (built at PASS-006, frozen there — the **SG-freeze
boundary**) models meaning: nodes (Action, Resource, Modifier, Constraint, Output)
and edges (TARGETS, HAS_MODIFIER, HAS_CONSTRAINT, PRODUCES). The middle-end
annotates it but never mutates it.

Node identity is **content-stable, position-derived**:
`kind.symbolId.startLine.startColumn` (e.g. `Action.AIL.OP.EXTRACT.1.1`).
Order-independent by construction — no normative traversal order required, which is
what makes cross-language reproducibility honest.

## 7. Diagnostics — [ADR-0004](adr/0004-diagnostic-codes.md), [RFC-011](rfc/RFC-011-diagnostics.md)

One scheme: `AIL-<PHASE>-<NNN>`, self-locating, per-phase append-only.
`severity`/`location`/`recovery` are payload fields, never encoded in the code.
Registry: [`../spec/diagnostics/registry.json`](../spec/diagnostics/registry.json),
which also carries the migration map from the four legacy schemes. Note the one
behavior change: under hybrid-core, an unregistered operator is a **warning**
(`AIL-NAME-001`), not the old hard halt.

## 8. Canonical serialization — [RFC-012](rfc/RFC-012-canonical-serialization.md)

RFC-012 makes AIR byte-reproducible: sort object keys (ASCII), strip whitespace
outside strings, pre-sort arrays by identity, SHA-256 the UTF-8 bytes. Reference
implementation: [`../tests/canonicalize.py`](../tests/canonicalize.py). The canonical
AIR of the golden fixture hashes to:

```
f20f4ba7cb26a7408ea51d3a48e447d7d98160567199f9bae6b4617a7ee4fb7a
```

## 9. Layer 0 packaging — [ADR-0005](adr/0005-skill-source-and-adapters.md), [RFC-007](rfc/RFC-007-are-plugin-contract.md)

The Skill is authored once (`skill/skill.source.md`) and adapters are **generated**
per runtime (Claude, OpenAI, Gemini, generic), each provenance-stamped. Adapters
cannot drift because they compile from one source — the same guarantee applied to
packaging that Section 2 applies to the language.

## 10. Conformance — [RFC-009](rfc/RFC-009-conformance-suite.md)

The golden harness is the behavioral contract. Each pipeline boundary gets a frozen
snapshot (`tokens.json`, `ast.json`, `semantic.graph.json`, `execution.plan.json`,
`air.json`, `diagnostics.json`) plus a `manifest.json`. Multi-language compilers are
conformant iff they reproduce the byte-identical canonical hash. The reconciled
RFC-009 also absorbs the review-era "RFC-014/RFC-015" conformance material, which
never existed in the numbered suite — folded here to close that mismatch.

---

### Decision index

| ADR | Decision |
|-----|----------|
| [0001](adr/0001-hybrid-core-lexicon.md) | Hybrid-core operator lexicon |
| [0002](adr/0002-canonical-pass-pipeline.md) | Canonical 15-pass pipeline |
| [0003](adr/0003-node-identity.md) | Content-stable, position-derived node identity |
| [0004](adr/0004-diagnostic-codes.md) | Phase-prefixed diagnostic codes |
| [0005](adr/0005-skill-source-and-adapters.md) | Single skill source -> generated adapters |
| [0006](adr/0006-repo-structure.md) | Spec-first, layer-partitioned monorepo |
