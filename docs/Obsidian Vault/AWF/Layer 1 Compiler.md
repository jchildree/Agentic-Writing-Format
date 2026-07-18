# Layer 1 Compiler

Deterministic 15-pass compiler (AIL). Fully specified, implementation stubbed. TypeScript and Rust targets.

## Pipeline

```text
PASS-001  Lex
PASS-002  Parse
PASS-003  Normalize       desugars block form to operator form
PASS-004  Macro
PASS-005  Name Resolution
PASS-006  Semantic Bind   SG-FREEZE: Semantic Graph locked here
PASS-007  Type Check
PASS-008  Capability Resolution
PASS-009  Constraint Resolution
PASS-010  Audited Optimization
PASS-011  EPI Lowering    SG -> Execution Plan IR (strict DAG)
PASS-012  Control-Flow
PASS-013  Verification
PASS-014  AIR Lowering    EPI -> Agent Intermediate Representation
PASS-015  ARE Emission    AIR -> provider payload
```

## Key Boundaries

- PASS-006: SG freeze. Middle-end (007-010) annotates only, never mutates.
- PASS-011: Lowering seam. Strict DAG from here on.

## Conformance

Compiler is conformant when `python3 canonicalize.py tests/golden/extract-basic/air.json` produces:

`f20f4ba7cb26a7408ea51d3a48e447d7d98160567199f9bae6b4617a7ee4fb7a`

See `RFC-009-conformance-suite.md` and `RFC-012-canonical-serialization.md`.

## Related

[[AWF Index]]
[[ADR-0002 Canonical Pass Pipeline]]
[[ADR-0003 Node Identity]]
[[ADR-0004 Diagnostic Codes]]
[[Layer 0 Skill]]
