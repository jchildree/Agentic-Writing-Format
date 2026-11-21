import {
  ASTConstraint, ASTIdentifier, ASTModifier, ASTOperator, ASTOutputContract, ASTProgram, ASTStatement,
  Diagnostic, Location, Token, TokenType, TokensOutput,
} from "./types";
import { diag } from "./diagnostics";

// PASS-002 Parsing against awf.ebnf:
//   statement = operator target "->" modifier+ [ "|" constraint+ ] "=>" output
// Errors never throw: a bad statement yields a diagnostic, the parser skips to the
// next line, and every well-formed statement still reaches the AST.

export interface ParseResult {
  ast: ASTProgram;
  diagnostics: Diagnostic[];
}

const WORD: TokenType[] = ["IDENTIFIER", "KEYWORD"];
const VALUE: TokenType[] = ["IDENTIFIER", "KEYWORD", "STRING", "NUMBER"];

class SyntaxError extends Error {
  constructor(readonly diagnostic: Diagnostic) { super(diagnostic.message); }
}

export function parse(input: TokensOutput): ParseResult {
  const { tokens } = input;
  const diagnostics: Diagnostic[] = [];
  const body: ASTStatement[] = [];
  let pos = 0;
  let statementLine = 1;

  const peek = (): Token => tokens[pos];
  /** Statements are single-line (awf.ebnf): a token on a later line ends the statement. */
  const onStatementLine = (): boolean => peek().type !== "EOF" && peek().location.startLine === statementLine;
  const consume = (): Token => tokens[Math.min(pos++, tokens.length - 1)];

  function describe(t: Token): string {
    if (t.type === "EOF") return "end of input";
    if (t.location.startLine !== statementLine) return "end of line";
    return `${t.type} "${t.value}"`;
  }

  function fail(expected: string, t: Token = peek(), code = "AIL-PARSE-003"): never {
    throw new SyntaxError(diag(code, "error", `Expected ${expected}, found ${describe(t)}.`, errorLocation(t)));
  }

  /** When the line ran out, point at the cursor just past the last token on it. */
  function errorLocation(t: Token): Location {
    if (t.type !== "EOF" && t.location.startLine === statementLine) return t.location;
    const last = tokens[pos - 1]?.location;
    if (!last || last.endLine !== statementLine) return t.location;
    return { startLine: last.endLine, startColumn: last.endColumn, endLine: last.endLine, endColumn: last.endColumn };
  }

  function expect(types: TokenType[], expected: string, code?: string): Token {
    if (!onStatementLine() || !types.includes(peek().type)) fail(expected, peek(), code);
    return consume();
  }

  /** `key:value` pairs share one shape for modifiers and constraints. */
  function parsePair(keyLabel: string): { key: Token; value: Token } {
    const key = expect(WORD, keyLabel);
    expect(["COLON"], `":" after "${key.value}"`);
    const value = expect(VALUE, `a value for "${key.value}"`);
    return { key, value };
  }

  function parseModifier(): ASTModifier {
    const { key, value } = parsePair("a modifier (Key:Value)");
    return { type: "Modifier", name: key.value, value: value.value, location: spanOf(key.location, value.location) };
  }

  function parseConstraint(): ASTConstraint {
    const priorityTok = onStatementLine() && peek().type === "PRIORITY" ? consume() : undefined;
    const { key, value } = parsePair("a constraint (Name:Value)");
    return {
      type: "Constraint",
      priority: priorityTok?.value,
      name: key.value,
      value: value.value,
      location: spanOf((priorityTok ?? key).location, value.location),
      nameLocation: key.location,
    };
  }

  function parseStatement(): ASTStatement {
    const opTok = expect(WORD, "an operator (e.g. Extract, Summarize)");
    const operator: ASTOperator = { type: "Operator", value: opTok.value, location: opTok.location };

    const tgtTok = expect(["IDENTIFIER"], `a target after "${opTok.value}"`, "AIL-PARSE-002");
    const target: ASTIdentifier = { type: "Identifier", value: tgtTok.value, location: tgtTok.location };

    expect(["ARROW"], `"->" after target "${tgtTok.value}"`);

    const modifiers: ASTModifier[] = [parseModifier()];
    while (onStatementLine() && WORD.includes(peek().type)) modifiers.push(parseModifier());

    const constraints: ASTConstraint[] = [];
    if (onStatementLine() && peek().type === "PIPE") {
      consume();
      constraints.push(parseConstraint());
      while (onStatementLine() && (peek().type === "PRIORITY" || WORD.includes(peek().type))) {
        constraints.push(parseConstraint());
      }
    }

    expect(["OUTPUT_ARROW"], `"=>" and an output format`);
    const fmtTok = expect(WORD, "an output format (e.g. JSON, Markdown)");
    const outputContract: ASTOutputContract = { type: "OutputContract", format: fmtTok.value, location: fmtTok.location };

    return { type: "Statement", operator, target, modifiers, constraints, outputContract };
  }

  /** Panic-mode recovery: drop the rest of the line the error happened on. */
  function skipLine(errorLine: number): void {
    while (peek().type !== "EOF" && peek().location.startLine <= errorLine) consume();
  }

  while (peek().type !== "EOF") {
    statementLine = peek().location.startLine;
    try {
      const statement = parseStatement();
      if (onStatementLine()) fail("end of line after the output format");
      body.push(statement);
    } catch (err) {
      if (!(err instanceof SyntaxError)) throw err;
      diagnostics.push(err.diagnostic);
      skipLine(statementLine);
    }
  }

  if (body.length === 0 && diagnostics.length === 0) {
    diagnostics.push(diag("AIL-PARSE-003", "error", "Expected at least one statement, found end of input.", peek().location));
  }

  return { ast: { type: "Program", body }, diagnostics };
}

function spanOf(start: Location, end: Location): Location {
  return { startLine: start.startLine, startColumn: start.startColumn, endLine: end.endLine, endColumn: end.endColumn };
}
