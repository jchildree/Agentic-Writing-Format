# RFC-008 — Standard Library (stdlib) Macros

**Status:** Draft (v1.0.0) · **Layer:** 1 (expanded at PASS-004)

stdlib macros expand into canonical AWF statements at PASS-004, before Name
Resolution. Macros resolve against the `stdlib.*` namespace; vendor extensions use
vendor-prefixed namespaces. A macro MUST expand to grammar-valid canonical form and
MUST NOT introduce Core Operators outside the versioned Core Set.
