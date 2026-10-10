# RFC-007 — Agent Runtime Emitter (ARE) Plugin Contract

**Status:** Draft (v1.0.0) · **Layer:** 1 (PASS-015) + Layer 0 packaging

## ARE interface (Layer 1)
```
interface AgentRuntimeEmitter {
  metadata(): RuntimeCapabilities;
  validate(air: AIRPayload): ValidationResult;
  emit(air: AIRPayload): RuntimePayload;
}
```
An emitter MUST refuse to emit an AIR payload carrying any `error`-severity
diagnostic.

## Layer 0 adapters (ADR-0005)
The Skill's per-runtime adapters are the Layer-0 analogue of an ARE: generated from
one source, provenance-stamped, valid only if they round-trip the source directives.
