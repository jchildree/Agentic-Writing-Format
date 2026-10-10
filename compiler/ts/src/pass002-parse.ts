import { Token, TokensOutput, ASTProgram, ASTStatement, ASTModifier, ASTConstraint, ASTOperator, ASTIdentifier, ASTOutputContract, Location } from "./types";

export function parse(input: TokensOutput): ASTProgram {
  const { tokens } = input;
  let pos = 0;

  const peek = (): Token => tokens[pos];
  const consume = (): Token => tokens[pos++];

  function expect(type: string): Token {
    const t = consume();
    if (t.type !== type) throw new Error(`Expected ${type}, got ${t.type} at ${t.location.startLine}:${t.location.startColumn}`);
    return t;
  }

  function parseStatement(): ASTStatement {
    const opTok = consume();
    const operator: ASTOperator = { type: "Operator", value: opTok.value, location: opTok.location };

    const tgtTok = expect("IDENTIFIER");
    const target: ASTIdentifier = { type: "Identifier", value: tgtTok.value, location: tgtTok.location };

    expect("ARROW");

    const modifiers: ASTModifier[] = [];
    while (peek().type !== "PIPE" && peek().type !== "OUTPUT_ARROW" && peek().type !== "EOF") {
      const keyTok = consume();
      expect("COLON");
      const valTok = consume();
      const loc: Location = {
        startLine: keyTok.location.startLine,
        startColumn: keyTok.location.startColumn,
        endLine: valTok.location.endLine,
        endColumn: valTok.location.endColumn,
      };
      modifiers.push({ type: "Modifier", name: keyTok.value, value: valTok.value, location: loc });
    }

    const constraints: ASTConstraint[] = [];
    if (peek().type === "PIPE") {
      consume();
      while (peek().type !== "OUTPUT_ARROW" && peek().type !== "EOF") {
        let priority: string | undefined;
        let spanStartLine: number;
        let spanStartCol: number;

        if (peek().type === "PRIORITY") {
          const prioTok = consume();
          priority = prioTok.value;
          spanStartLine = prioTok.location.startLine;
          spanStartCol = prioTok.location.startColumn;
        } else {
          spanStartLine = peek().location.startLine;
          spanStartCol = peek().location.startColumn;
        }

        const nameTok = consume();
        expect("COLON");
        const valTok = consume();

        constraints.push({
          type: "Constraint",
          priority,
          name: nameTok.value,
          value: valTok.value,
          location: {
            startLine: spanStartLine,
            startColumn: spanStartCol,
            endLine: valTok.location.endLine,
            endColumn: valTok.location.endColumn,
          },
          nameLocation: nameTok.location,
        });
      }
    }

    expect("OUTPUT_ARROW");
    const fmtTok = consume();
    const outputContract: ASTOutputContract = { type: "OutputContract", format: fmtTok.value, location: fmtTok.location };

    return { type: "Statement", operator, target, modifiers, constraints, outputContract };
  }

  const body: ASTStatement[] = [];
  while (peek().type === "NEWLINE") consume();
  while (peek().type !== "EOF") {
    body.push(parseStatement());
    while (peek().type === "NEWLINE") consume();
  }

  return { type: "Program", body };
}
