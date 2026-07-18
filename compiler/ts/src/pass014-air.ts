import { ASTProgram, SemanticGraph, ExecutionPlan, AIR, AIRStep, AIRConstraint, Diagnostic } from "./types";

const AIR_SCHEMA = "https://agentinstruction.org/v1/air-v1.0.0.schema.json";

export function lowerToAIR(ast: ASTProgram, sg: SemanticGraph, epi: ExecutionPlan, diagnostics: Diagnostic[] = []): AIR {
  const actionIdToStmt = new Map(
    ast.body.map((stmt, idx) => [sg.statements[idx].rootNode, stmt])
  );

  const execution_pipeline: AIRStep[] = epi.nodes.map((step, idx) => {
    const actionId = step.id.slice("STEP.".length);
    const stmt = actionIdToStmt.get(actionId);
    if (!stmt) throw new Error(`No statement for action: ${actionId}`);

    const modifiers: Record<string, string> = {};
    for (const mod of stmt.modifiers) modifiers[mod.name.toLowerCase()] = mod.value;

    return { step: idx + 1, action: stmt.operator.value, target: stmt.target.value, modifiers };
  });

  const constraints: AIRConstraint[] = [];
  let cIdx = 0;
  for (const stmt of ast.body) {
    for (const con of stmt.constraints) {
      cIdx++;
      constraints.push({
        id: `c_${cIdx}`,
        priority: con.priority ? parseInt(con.priority.slice(1), 10) : 0,
        type: con.name,
        rule: con.value,
        semantics: con.name === "Lock"
          ? `Enforces immutable output boundary: ${con.value}`
          : `Enforces constraint: ${con.value}`,
      });
    }
  }

  const hasLock = ast.body.some(s => s.constraints.some(c => c.name === "Lock"));

  return {
    $schema: AIR_SCHEMA,
    version: "1.0",
    capabilities_required: epi.requiredCapabilities,
    execution_pipeline,
    constraints,
    output_contract: {
      format: ast.body[0]?.outputContract.format ?? "Raw",
      strictness: hasLock ? "Absolute" : "Relative",
    },
    diagnostics,
  };
}
