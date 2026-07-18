#!/usr/bin/env python3
"""RFC-012 canonical serializer + SHA-256 (reference implementation).

Canonical form:
  1. Object keys sorted lexicographically (ASCII).
  2. Whitespace outside string literals stripped (minified).
  3. Arrays preserved in given order (producers pre-sort by id / from,to,type).
  4. SHA-256 over the UTF-8 canonical bytes.
"""
import json, hashlib, sys

def canonical_bytes(obj) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"),
                      ensure_ascii=False).encode("utf-8")

def sha256_of(path: str) -> str:
    with open(path) as f:
        obj = json.load(f)
    return hashlib.sha256(canonical_bytes(obj)).hexdigest()

if __name__ == "__main__":
    for p in sys.argv[1:]:
        print(f"{sha256_of(p)}  {p}")
