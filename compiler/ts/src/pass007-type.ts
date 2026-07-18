import { SemanticGraph, Diagnostic } from "./types";

export function checkTypes(sg: SemanticGraph): { diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];

  for (const stmt of sg.statements) {
    const action = sg.nodes.find(n => n.id === stmt.rootNode);
    if (!action || action.kind !== "Action") continue;

    const edgeTypes = new Set(sg.edges.filter(e => e.from === stmt.rootNode).map(e => e.type));

    for (const required of ["TARGETS", "PRODUCES"] as const) {
      if (!edgeTypes.has(required)) {
        diagnostics.push({
          code: "AIL-TYPE-001",
          severity: "error",
          message: `Action "${action.symbolId}" missing required edge type "${required}".`,
          location: action.location,
        });
      }
    }
  }

  return { diagnostics };
}
