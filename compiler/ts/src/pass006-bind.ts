import { ASTProgram, SemanticGraph, SGNode, SGEdge, Location } from "./types";

function makeNodeId(kind: string, symId: string, loc: Location): string {
  return `${kind}.${symId}.${loc.startLine}.${loc.startColumn}`;
}

function makeSymbolId(prefix: string, name: string): string {
  return `${prefix}.${name.toUpperCase()}`;
}

// SG node location is the name token's span, not the full syntactic span
function nameLoc(name: string, startLine: number, startColumn: number): Location {
  return { startLine, startColumn, endLine: startLine, endColumn: startColumn + name.length };
}

export function bind(ast: ASTProgram): SemanticGraph {
  const nodes: SGNode[] = [];
  const edges: SGEdge[] = [];

  ast.body.forEach((stmt, idx) => {
    const actionSymId = makeSymbolId("AIL.OP", stmt.operator.value);
    const actionId = makeNodeId("Action", actionSymId, stmt.operator.location);
    nodes.push({ id: actionId, kind: "Action", symbolId: actionSymId, attributes: {}, location: stmt.operator.location });

    const resSymId = makeSymbolId("AIL.RES", stmt.target.value);
    const resId = makeNodeId("Resource", resSymId, stmt.target.location);
    nodes.push({ id: resId, kind: "Resource", symbolId: resSymId, attributes: {}, location: stmt.target.location });
    edges.push({ from: actionId, to: resId, type: "TARGETS" });

    for (const mod of stmt.modifiers) {
      const modSymId = makeSymbolId("AIL.MOD", mod.name);
      const loc = nameLoc(mod.name, mod.location.startLine, mod.location.startColumn);
      const modId = makeNodeId("Modifier", modSymId, loc);
      nodes.push({ id: modId, kind: "Modifier", symbolId: modSymId, attributes: { value: mod.value }, location: loc });
      edges.push({ from: actionId, to: modId, type: "HAS_MODIFIER" });
    }

    for (const con of stmt.constraints) {
      const conSymId = makeSymbolId("AIL.CON", con.name);
      const conId = makeNodeId("Constraint", conSymId, con.nameLocation);
      const attrs: Record<string, string> = {};
      if (con.priority) attrs.priority = con.priority;
      attrs.value = con.value;
      nodes.push({ id: conId, kind: "Constraint", symbolId: conSymId, attributes: attrs, location: con.nameLocation });
      edges.push({ from: actionId, to: conId, type: "HAS_CONSTRAINT" });
    }

    const outSymId = makeSymbolId("AIL.OUT", stmt.outputContract.format);
    const outId = makeNodeId("Output", outSymId, stmt.outputContract.location);
    nodes.push({ id: outId, kind: "Output", symbolId: outSymId, attributes: { format: stmt.outputContract.format }, location: stmt.outputContract.location });
    edges.push({ from: actionId, to: outId, type: "PRODUCES" });
  });

  nodes.sort((a, b) => a.id.localeCompare(b.id));
  edges.sort((a, b) => a.from.localeCompare(b.from) || a.type.localeCompare(b.type));

  const statements = ast.body.map((stmt, idx) => {
    const actionSymId = makeSymbolId("AIL.OP", stmt.operator.value);
    const actionId = makeNodeId("Action", actionSymId, stmt.operator.location);
    return { id: `STATEMENT.${String(idx + 1).padStart(3, "0")}`, rootNode: actionId };
  });

  return { nodes, edges, statements };
}
