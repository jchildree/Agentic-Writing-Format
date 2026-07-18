import { ASTProgram, Diagnostic } from "./types";

export function expandMacros(ast: ASTProgram): { ast: ASTProgram; diagnostics: Diagnostic[] } {
  return { ast, diagnostics: [] };
}
