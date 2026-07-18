import { SemanticGraph, ExecutionPlan, EPINode, RCD } from "./types";

export function lowerToEPI(sg: SemanticGraph, rcd: RCD): ExecutionPlan {
  const capMap = new Map<string, string>();
  for (const cap of rcd.capabilities) {
    for (const op of cap.operations) capMap.set(op, cap.id);
  }

  const nodes: EPINode[] = [];
  const requiredCapabilities: string[] = [];

  for (const stmt of sg.statements) {
    const actionNode = sg.nodes.find(n => n.id === stmt.rootNode);
    if (!actionNode) throw new Error(`Action node not found: ${stmt.rootNode}`);

    const capability = capMap.get(actionNode.symbolId);
    if (!capability) throw new Error(`No capability for operation: ${actionNode.symbolId}`);

    if (!requiredCapabilities.includes(capability)) requiredCapabilities.push(capability);

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
