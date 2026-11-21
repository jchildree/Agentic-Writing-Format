import { Diagnostic, Location, Severity } from "./types";

/** Builds a diagnostic; the phase is filled in later by `finalizeDiagnostics`. */
export function diag(code: string, severity: Severity, message: string, location?: Location): Diagnostic {
  return location ? { code, severity, message, location } : { code, severity, message };
}

export function hasErrors(diagnostics: readonly Diagnostic[]): boolean {
  return diagnostics.some(d => d.severity === "error");
}

/** `AIL-PARSE-002` -> `PARSE` */
function phaseOf(code: string): string {
  return code.split("-")[1] ?? "UNKNOWN";
}

/**
 * RFC-011 ordering: primary `code`, secondary `location.startLine`.
 * Column and message are extra tie-breaks so the order is total and deterministic.
 */
export function finalizeDiagnostics(diagnostics: readonly Diagnostic[]): Diagnostic[] {
  const withPhase = diagnostics.map(d => ({ ...d, phase: phaseOf(d.code) }));
  return withPhase.sort((a, b) =>
    compareStrings(a.code, b.code) ||
    (a.location?.startLine ?? 0) - (b.location?.startLine ?? 0) ||
    (a.location?.startColumn ?? 0) - (b.location?.startColumn ?? 0) ||
    compareStrings(a.message, b.message)
  );
}

// Plain code-unit comparison: locale-independent, so output is byte-stable everywhere.
function compareStrings(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
