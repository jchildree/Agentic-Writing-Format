import { ASTProgram, Diagnostic } from "./types";
import { CORE_ACTIONS } from "./lexicon";

export function resolveName(ast: ASTProgram): { diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];
  const seenResources = new Set<string>();

  for (const stmt of ast.body) {
    if (!CORE_ACTIONS.has(stmt.operator.value)) {
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
