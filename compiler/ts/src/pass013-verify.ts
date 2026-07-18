import { ExecutionPlan, Diagnostic } from "./types";

export function verifyEPI(epi: ExecutionPlan): { diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];
  const nodeIds = new Set<string>();

  for (const node of epi.nodes) {
    if (nodeIds.has(node.id)) {
      diagnostics.push({ code: "AIL-EPI-001", severity: "error", message: `Duplicate EPI node id "${node.id}".` });
    }
    nodeIds.add(node.id);
  }

  if (epi.entryPoint && !nodeIds.has(epi.entryPoint)) {
    diagnostics.push({ code: "AIL-EPI-003", severity: "error", message: `entryPoint "${epi.entryPoint}" not found in nodes.` });
  }

  for (const edge of epi.edges) {
    if (!nodeIds.has(edge.from)) {
      diagnostics.push({ code: "AIL-EPI-004", severity: "error", message: `Edge source "${edge.from}" not found.` });
    }
    if (!nodeIds.has(edge.to)) {
      diagnostics.push({ code: "AIL-EPI-004", severity: "error", message: `Edge target "${edge.to}" not found.` });
    }
  }

  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(id: string): boolean {
    if (stack.has(id)) return true;
    if (visited.has(id)) return false;
    stack.add(id);
    visited.add(id);
    for (const edge of epi.edges.filter(e => e.from === id)) {
      if (dfs(edge.to)) {
        diagnostics.push({ code: "AIL-EPI-002", severity: "error", message: `Cyclic dependency detected at node "${id}".` });
        return true;
      }
    }
    stack.delete(id);
    return false;
  }

  for (const node of epi.nodes) {
    if (!visited.has(node.id)) dfs(node.id);
  }

  return { diagnostics };
}
