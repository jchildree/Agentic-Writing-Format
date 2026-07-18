import { SemanticGraph, RCD, Diagnostic } from "./types";

export function resolveCapabilities(sg: SemanticGraph, rcd: RCD): { diagnostics: Diagnostic[] } {
  const covered = new Set(rcd.capabilities.flatMap(c => c.operations));
  const diagnostics: Diagnostic[] = [];

  for (const node of sg.nodes) {
    if (node.kind === "Action" && !covered.has(node.symbolId)) {
      diagnostics.push({
        code: "AIL-CAP-003",
        severity: "error",
        message: `Runtime lacks capability for operation "${node.symbolId}".`,
        location: node.location,
      });
    }
  }

  return { diagnostics };
}
