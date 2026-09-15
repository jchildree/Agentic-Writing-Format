# RFC-006 — Runtime Capability Descriptor (RCD)

**Status:** Draft (v1.0.0) · **Layer:** 1 (consumed at PASS-008)

An RCD declares a runtime's capabilities and limits. Schema:
[`../../spec/schemas/rcd-v1.0.0.schema.json`](../../spec/schemas/rcd-v1.0.0.schema.json).
PASS-008 resolves each operation against the RCD; unresolved operations emit
`AIL-CAP-003`. When multiple capabilities satisfy an operation, selection is the
lexically first capability `id` (deterministic tie-break).
