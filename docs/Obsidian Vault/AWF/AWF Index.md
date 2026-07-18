# AWF Index

Agentic Writing Format -- model-agnostic standard and compiler framework for deterministic AI agent instructions.

## Layers

- **Layer 0**: Portable authoring format + LLM skill. Shippable now. No compiler required.
- **Layer 1 (AIL)**: 15-pass deterministic compiler. Fully specified, implementation stubbed.

## Core Syntax

`Operator Target -> Modifiers | Constraints => Output`

Golden fixture: `Extract SystemLogs -> Depth:Critical | P1 Lock:RawJSON => JSON`

## Key Invariants

- SG is immutable after PASS-006
- Pass numbers are stable forever (ADR-0002)
- Core operator set is closed at 16 actions + 2 constraints (ADR-0001)
- Adapters are generated from `skill/skill.source.md` -- never hand-edited
- Golden fixture hash is frozen: `f20f4ba7cb26a7408ea51d3a48e447d7d98160567199f9bae6b4617a7ee4fb7a`

## Related

[[ADR Index]]
[[Layer 0 Skill]]
[[Layer 1 Compiler]]
[[Skills Index]]
