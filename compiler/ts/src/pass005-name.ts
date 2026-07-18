import { ASTProgram, Diagnostic } from "./types";

const CORE_OPS = new Set([
  "Extract","Analyze","Synthesize","Generate","Transform",
  "Compare","Evaluate","Convert","Compress","Expand",
  "Optimize","Validate","Summarize","Translate","Classify","Rank",
  "Lock","Shield",
]);

export function resolveName(ast: ASTProgram): { diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];
  const seenResources = new Set<string>();

  for (const stmt of ast.body) {
    if (!CORE_OPS.has(stmt.operator.value)) {
      diagnostics.push({
        code: "AIL-NAME-001",
        severity: "warning",
        message: `Extension Operator "${stmt.operator.value}" resolved via advisory; not in Core Operator Set.`,
        location: stmt.operator.location,
      });
    }

    const key = stmt.target.value.toUpperCase();
    if (seenResources.has(key)) {
      diagnostics.push({
        code: "AIL-NAME-002",
        severity: "error",
        message: `Duplicate resource symbol "${stmt.target.value}" in scope.`,
        location: stmt.target.location,
      });
    } else {
      seenResources.add(key);
    }
  }

  return { diagnostics };
}
