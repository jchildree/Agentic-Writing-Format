import * as crypto from "crypto";

// RFC-012 canonical serialization. Must stay byte-identical to ../../canonicalize.py:
// sorted keys, minified, arrays kept in order, UTF-8, SHA-256.

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortKeys((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

export function canonicalHash(value: unknown): string {
  return crypto.createHash("sha256").update(Buffer.from(canonicalJson(value), "utf8")).digest("hex");
}
