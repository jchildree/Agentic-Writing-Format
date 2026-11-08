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
import { hasErrors } from "./diagnostics";
import { AIR, ASTProgram, Diagnostic, ExecutionPlan, RCD, SemanticGraph, TokensOutput } from "./types";

/** Every intermediate representation, for inspection (`awf compile --stage ...`). */
export interface CompileArtifacts {
  tokens: TokensOutput;
  ast: ASTProgram;
  sg: SemanticGraph;
  epi: ExecutionPlan;
  air: AIR;
}

export interface CompileResult extends CompileArtifacts {
  /** True when no error-severity diagnostic was raised; only then will ARE emit. */
  ok: boolean;
  /** Sorted per RFC-011; identical to `air.diagnostics`. */
  diagnostics: Diagnostic[];
}

const BYTE_ORDER_MARK = /^﻿/;

/**
 * Runs PASS-001..014. Never throws on bad input: problems surface as diagnostics,
 * and the pipeline keeps going so one run reports as much as it can.
 */
export function compileDetailed(source: string, rcd: RCD): CompileResult {
  const diagnostics: Diagnostic[] = [];
  const collect = <T extends { diagnostics: Diagnostic[] }>(result: T): T => {
    diagnostics.push(...result.diagnostics);
    return result;
  };

  const { source: normalized } = collect(normalize(source.replace(BYTE_ORDER_MARK, "").trimEnd()));
  const { tokens } = collect(lex(normalized));
  const { ast: parsedAst } = collect(parse({ tokens }));
  const { ast } = collect(expandMacros(parsedAst));
  collect(resolveName(ast));

  const sg = bind(ast); // SG-FREEZE: passes 007-010 only annotate from here on.

  collect(checkTypes(sg));
  collect(resolveCapabilities(sg, rcd));
  collect(resolveConstraints(sg));
  collect(auditedOptimize(sg));

  const { epi } = collect(expandControlFlow(lowerToEPI(sg, rcd)));
  collect(verifyEPI(epi));

  const air = lowerToAIR(ast, sg, epi, diagnostics);

  return {
    ok: !hasErrors(air.diagnostics),
    diagnostics: air.diagnostics,
    tokens: { tokens },
    ast,
    sg,
    epi,
    air,
  };
}

export function compile(source: string, rcd: RCD): AIR {
  return compileDetailed(source, rcd).air;
}

export function compileAndEmit(source: string, rcd: RCD, runtimeId: RuntimeId): AREPayload {
  return emit(compile(source, rcd), runtimeId);
}
