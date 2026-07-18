import { SemanticGraph, Diagnostic } from "./types";

export function resolveConstraints(sg: SemanticGraph): { diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];

  for (const stmt of sg.statements) {
    const conNodes = sg.edges
      .filter(e => e.from === stmt.rootNode && e.type === "HAS_CONSTRAINT")
      .map(e => sg.nodes.find(n => n.id === e.to))
      .filter((n): n is NonNullable<typeof n> => n != null);

    const byType = new Map<string, number[]>();
    for (const node of conNodes) {
      const p = node.attributes.priority ? parseInt(node.attributes.priority.slice(1), 10) : 0;
      const group = byType.get(node.symbolId) ?? [];
      group.push(p);
      byType.set(node.symbolId, group);
    }

    for (const [symId, priorities] of byType) {
      if (priorities.length > 1) {
        const sorted = [...priorities].sort((a, b) => a - b);
        diagnostics.push({
          code: "AIL-CON-004",
          severity: "warning",
          message: `Priority conflict on "${symId}": P${sorted[0]} overrides P${sorted[sorted.length - 1]}.`,
        });
      }
    }
  }

  return { diagnostics };
}
