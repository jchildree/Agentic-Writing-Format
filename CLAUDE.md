# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

**AWF (Agentic Writing Format)** is a model-agnostic specification and compiler framework for writing deterministic AI agent instructions. It is a *spec-first* repo: the normative documents at the root define everything; code implements the spec, not the other way around.

Two layers, one shared contract:

- **Layer 0** (shippable now): A portable authoring format + LLM skill. Write once (`skill/skill.source.md`), generate runtime adapters (Claude, OpenAI, Gemini, generic). No compiler needed - agents execute directly.
- **Layer 1 / AIL** (fully specified, implementation-stubbed): A 15-pass deterministic compiler (`AWF -> AST -> SG -> EPI -> AIR -> provider payload`) in TypeScript and Rust. Must byte-reproduce the golden fixture hash to be conformant.

## Commands

```bash
# Regenerate all per-runtime skill adapters from the single source
python3 skill/generate.py

# Compute canonical SHA-256 hash of the golden fixture AIR (conformance check)
python3 canonicalize.py tests/golden/extract-basic/air.json
# Expected: f20f4ba7cb26a7408ea51d3a48e447d7d98160567199f9bae6b4617a7ee4fb7a

# Build and conformance-check the TypeScript reference compiler
cd compiler/ts && npm install && npm run build && npm run conformance
# Expected: PASS f20f4ba7cb26a7408ea51d3a48e447d7d98160567199f9bae6b4617a7ee4fb7a
```

Conformance is verified when a compiler reproduces the canonical AIR hash byte-for-byte. See `RFC-009-conformance-suite.md`.

## Architecture

```
Layer 0 (skill/):
  skill/skill.source.md  ->  skill/generate.py  ->  skill/adapters/{claude,openai,gemini,generic}/

Layer 1 (compiler/):
  AWF source
    PASS-001 Lex
    PASS-002 Parse
    PASS-003 Normalize          <- desugars block form to operator form
    PASS-004 Macro
    PASS-005 Name Resolution
    PASS-006 Semantic Bind      <- SG-FREEZE: Semantic Graph locked after this pass
    PASS-007 Type Check
    PASS-008 Capability Resolution
    PASS-009 Constraint Resolution
    PASS-010 Audited Optimization
    PASS-011 EPI Lowering       <- SG -> Execution Plan IR (DAG)
    PASS-012 Control-Flow
    PASS-013 Verification
    PASS-014 AIR Lowering       <- EPI -> Agent Intermediate Representation
    PASS-015 ARE Emission       <- AIR -> provider payload (Claude, OpenAI, etc.)
```

**Key boundaries:**
- `PASS-006` = SG-freeze: middle-end (007-010) annotates the Semantic Graph, never mutates it
- `PASS-011` = lowering seam: strict DAG from here on
- Layer 0 runtime runs a reduced subset: passes 001, 002, 003, 005, 006, 009 only, then executes directly

**Core lexicon (closed, versioned):** 16 Core Actions + 2 Constraints in `spec/lexicon/core-operators.json`. Core Operators = `KEYWORD`; Extension Operators = `IDENTIFIER`. Strict profile compiles Extensions with a warning; Lenient profile interprets via advisory. Never add to core without a new ADR.

**Node identity:** `kind.symbolId.startLine.startColumn` - content-stable, position-derived, order-independent (see ADR-0003).

**Diagnostic codes:** `AIL-<PHASE>-<NNN>` where PHASE encodes which pass failed. Codes are append-only per phase (see `spec/diagnostics/registry.json` and ADR-0004).

**Reproducibility contract (RFC-012):** Identical input + Runtime Capability Descriptor -> byte-identical AIR across all implementations. The `canonicalize.py` script is the reference implementation.

## Key Files to Read First

| File | Purpose |
|------|---------|
| `PROTOCOL.md` | Master design protocol and decision index - read this before any architectural change |
| `CONTEXT.md` | Authoritative glossary - single source of term definitions |
| `spec/grammar/awf.ebnf` | Canonical EBNF grammar (1-indexed, half-open column spans) |
| `spec/lexicon/core-operators.json` | Closed operator set |
| `input.awf` | Golden fixture input: `Extract SystemLogs -> Depth:Critical | P1 Lock:RawJSON => JSON` |
| `tests/golden/extract-basic/air.json` | Canonical AIR output (frozen snapshot) |
| `RFC-009-conformance-suite.md` | Multi-language compiler conformance contract |
| `RFC-012-canonical-serialization.md` | Byte-reproducibility guarantee |

ADRs (`0001-*.md` through `0006-*.md`) at repo root are closed decisions - they cannot be reopened without a new ADR. RFCs (`RFC-001` through `RFC-012`) are normative specs.

## Invariants - Never Break These

- **SG is immutable after PASS-006.** Middle-end passes annotate only.
- **Pass numbers are stable forever** (ADR-0002). Do not renumber.
- **Core operator set is closed** (ADR-0001). Extensions go through the Extension mechanism.
- **Adapters are generated, not hand-edited.** Edit `skill/skill.source.md`, then run `python3 skill/generate.py`. Each adapter header contains a provenance SHA-256.
- **Golden fixture hash is frozen.** Any change that alters `tests/golden/extract-basic/air.json` is a breaking spec change requiring an RFC update.
- **Layer 0 and Layer 1 are co-readers of one spec, not importers of each other.** No cross-layer imports.

## Agent skills

### Issue tracker

Issues tracked via The Question (skill-based, Claude Code). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context layout: `CONTEXT-MAP.md` at root points to per-context `CONTEXT.md` files. See `docs/agents/domain.md`.
