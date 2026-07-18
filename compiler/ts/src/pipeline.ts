import { normalize } from "./pass003-normalize";
import { lex } from "./pass001-lex";
import { parse } from "./pass002-parse";
import { expandMacros } from "./pass004-macro";
import { resolveName } from "./pass005-name";
import { bind } from "./pass006-bind";
import { checkTypes } from "./pass007-type";
import { resolveCapabilities } from "./pass008-cap";
import { resolveConstraints } from "./pass009-constraint";
import { auditedOptimize } from "./pass010-opt";
import { lowerToEPI } from "./pass011-epi";
import { expandControlFlow } from "./pass012-flow";
import { verifyEPI } from "./pass013-verify";
import { lowerToAIR } from "./pass014-air";
import { emit, RuntimeId, AREPayload } from "./pass015-are";
import { AIR, RCD, Diagnostic } from "./types";

export function compile(source: string, rcd: RCD): AIR {
  const diagnostics: Diagnostic[] = [];

  const { source: normalized, diagnostics: normDiags } = normalize(source.trimEnd());
  diagnostics.push(...normDiags);

  const tokens = lex(normalized);
  const ast = parse(tokens);

  const { ast: macroAst, diagnostics: macroDiags } = expandMacros(ast);
  diagnostics.push(...macroDiags);

  const { diagnostics: nameDiags } = resolveName(macroAst);
  diagnostics.push(...nameDiags);

  const sg = bind(macroAst);

  const { diagnostics: typeDiags } = checkTypes(sg);
  diagnostics.push(...typeDiags);

  const { diagnostics: capDiags } = resolveCapabilities(sg, rcd);
  diagnostics.push(...capDiags);

  const { diagnostics: conDiags } = resolveConstraints(sg);
  diagnostics.push(...conDiags);

  const { diagnostics: optDiags } = auditedOptimize(sg);
  diagnostics.push(...optDiags);

  const epi = lowerToEPI(sg, rcd);

  const { epi: flowEpi, diagnostics: flowDiags } = expandControlFlow(epi);
  diagnostics.push(...flowDiags);

  const { diagnostics: verifyDiags } = verifyEPI(flowEpi);
  diagnostics.push(...verifyDiags);

  return lowerToAIR(macroAst, sg, flowEpi, diagnostics);
}

export function compileAndEmit(source: string, rcd: RCD, runtimeId: RuntimeId): AREPayload {
  return emit(compile(source, rcd), runtimeId);
}
