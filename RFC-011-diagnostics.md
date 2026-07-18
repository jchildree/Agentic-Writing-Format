# RFC-011 — Diagnostic System & Error Codes

**Status:** Draft (v1.0.0) · **Layer:** 0/1 (shared)

Codes follow `AIL-<PHASE>-<NNN>` (ADR-0004). Payload shape:
`{ code, severity, phase, message, location?, recovery? }`. Diagnostic arrays are
sorted before snapshotting: primary `code`, secondary `location.startLine` (or
`nodeId`), tertiary `dependencyPath`. Registry + legacy migration map:
[`../../spec/diagnostics/registry.json`](../../spec/diagnostics/registry.json).
