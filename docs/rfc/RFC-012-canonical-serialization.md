# RFC-012 — Canonical Serialization & Hashing

**Status:** Draft (v1.0.0) · **Layer:** 0/1 (reproducibility contract)

## Canonical form
1. Object keys sorted lexicographically (ASCII).
2. Whitespace outside string literals stripped (minified).
3. Arrays pre-sorted by identity (`id`, or `from,to,type`).
4. SHA-256 over the UTF-8 canonical bytes.

## Guarantee
Identical input + RCD -> byte-identical canonical AIR -> identical SHA-256 across
TypeScript, Python, Rust, Go. Reference implementation:
[`../../tests/canonicalize.py`](../../tests/canonicalize.py).
