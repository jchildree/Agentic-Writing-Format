import { ExecutionPlan, Diagnostic } from "./types";

export function expandControlFlow(epi: ExecutionPlan): { epi: ExecutionPlan; diagnostics: Diagnostic[] } {
  return { epi, diagnostics: [] };
}
