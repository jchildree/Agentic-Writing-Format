import { SemanticGraph, ExecutionPlan, EPINode, RCD } from "./types";

// PASS-011 EPI Lowering: SG -> Execution Plan IR (RFC-010).

/**
 * Maps each operation to the capability that serves it. When several capabilities
 * offer the same operation, the lexically first `id` wins (RFC-006 tie-break).
 */
function buildCapabilityMap(rcd: RCD): Map<string, string> {
  const capMap = new Map<string, string>();
  const byId = [...rcd.capabilities].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for (const cap of byId) {
    for (const op of cap.operations) {
      if (!capMap.has(op)) capMap.set(op, cap.id);
    }
  }
  return capMap;
}

export function lowerToEPI(sg: SemanticGraph, rcd: RCD): ExecutionPlan {
  const capMap = buildCapabilityMap(rcd);
  const nodes: EPINode[] = [];
  const requiredCapabilities: string[] = [];

  for (const stmt of sg.statements) {
    const actionNode = sg.nodes.find(n => n.id === stmt.rootNode);
    if (!actionNode) throw new Error(`Internal: action node not found: ${stmt.rootNode}`);

    // A missing capability was already reported by PASS-008 (AIL-CAP-003); keep lowering
    // so later passes can still report, and leave the step unbound.
    const capability = capMap.get(actionNode.symbolId) ?? "";
    if (capability && !requiredCapabilities.includes(capability)) requiredCapabilities.push(capability);

    nodes.push({
      id: `STEP.${stmt.rootNode}`,
      kind: "STEP",
      operation: actionNode.symbolId,
      capability,
      inputs: sg.edges.filter(e => e.from === stmt.rootNode && e.type === "TARGETS").map(e => e.to),
      outputs: sg.edges.filter(e => e.from === stmt.rootNode && e.type === "PRODUCES").map(e => e.to),
    });
  }

  return {
    version: "1.0.0",
    entryPoint: nodes[0]?.id ?? "",
    nodes,
    edges: [],
    requiredCapabilities,
  };
}
