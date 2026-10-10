# CONTEXT — AWF Glossary

The single source of truth for terminology. Glossary only: no implementation
details, no specs, no decisions (those live in `docs/adr/` and `docs/rfc/`). When a
term here conflicts with usage anywhere else, this file wins.

## Layers & seam

- **AWF (Agentic Writing Format)** — the one normative authoring standard. Both
  layers cite it; neither owns it.
- **Layer 0** — the portable authoring standard plus the model-agnostic Agent Skill.
  Ships independently, requires no compiler.
- **Layer 1 (AIL)** — the optional deterministic compiler ecosystem. Depends on
  Layer 0's spec; the dependency never runs the other way.
- **One contract, two readers** — Layer 0 and Layer 1 are two consumers of a single
  spec, which is why they cannot drift.

## Profiles

- **Lenient (Runtime) profile** — tolerant interpretation: fills defaults, asks on a
  missing target, executes directly. The profile the Skill runs.
- **Strict (Compiler) profile** — rejects ambiguity, emits AIR, hashes
  deterministically. The profile the compiler runs.

## Vocabulary

- **Core Operator** — a member of the closed, versioned Core Operator Set. Reserved;
  lexes as `KEYWORD`; carries normative semantics.
- **Extension Operator** — any operator outside the Core Set. Lexes as `IDENTIFIER`;
  compiles with a warning in Strict, interpreted via advisory lexicon in Lenient.
- ("operator" used bare is imprecise — always say Core or Extension.)

## Surface syntax

- **Canonical form** — the single-line operator syntax. Normative.
- **Block form** — the multi-line `<System>` / `Key:` layout. Provisional sugar
  (v1.0); desugars into canonical form in PASS-003 Normalization.

## Pipeline & graphs

- **Front-end** — passes 001–006; produces the Semantic Graph.
- **Middle-end** — passes 007–010; annotates the SG, never mutates it.
- **Back-end** — passes 011–015; SG -> EPI -> AIR -> ARE.
- **SG-freeze boundary** — end of PASS-006. The SG contract is frozen here.
- **Runtime Happy Path** — the reduced subset {001, 002, 003, 005, 006, 009} the
  Lenient skill mentally runs; terminates in direct execution, not AIR.
- **Semantic Graph (SG)** — meaning graph (intent, target, modifier, constraint,
  output). May be cyclic in principle; carries no runtime ordering.
- **Execution Plan IR (EPI)** — the lowered runtime workflow. Strictly a DAG.
- **AIR (Agent Intermediate Representation)** — the immutable canonical execution IR.
- **ARE (Agent Runtime Emitter)** — backend adapter turning AIR into a provider payload.
- **RCD (Runtime Capability Descriptor)** — declares a runtime's capabilities.

## Identity & reproducibility

- **Node ID** — `kind.symbolId.startLine.startColumn`. Order-independent by
  construction (ADR-0003).
- **Canonical fixture** — one `input.awf`, one authoritative column map, one hash.
- **Reproducibility contract** — identical input + RCD -> byte-identical AIR across
  implementations (RFC-012).

## Diagnostics & packaging

- **Diagnostic code** — `AIL-<PHASE>-<NNN>`; self-locating; per-phase append-only.
- **Phase abbreviation** — one of LEX, PARSE, NORM, MACRO, NAME, SEM, TYPE, CAP, CON,
  OPT, EPI, FLOW, VERIFY, AIR, ARE.
- **Skill source** — the single normative Layer 0 document (`skill/skill.source.md`).
- **Adapter** — a generated, provenance-stamped per-runtime shim.
- **Adapter conformance** — a shim is valid only if it round-trips the source's directives.
