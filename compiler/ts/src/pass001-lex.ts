import { Token, TokenType, TokensOutput } from "./types";

const CORE = new Set([
  "Extract","Analyze","Synthesize","Generate","Transform",
  "Compare","Evaluate","Convert","Compress","Expand",
  "Optimize","Validate","Summarize","Translate","Classify","Rank",
  "Lock","Shield",
]);

export function lex(source: string): TokensOutput {
  const tokens: Token[] = [];
  let pos = 0;
  let line = 1;
  let col = 1;

  while (pos < source.length) {
    const startCol = col;
    const ch = source[pos];

    if (ch === " ") { pos++; col++; continue; }

    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && source[pos + 1] === "\n") { pos++; col++; }
      pos++; line++; col = 1;
      continue;
    }

    if (source.startsWith("=>", pos)) {
      tokens.push({ type: "OUTPUT_ARROW", value: "=>", location: { startLine: line, startColumn: startCol, endLine: line, endColumn: startCol + 2 } });
      pos += 2; col += 2; continue;
    }

    if (source.startsWith("->", pos)) {
      tokens.push({ type: "ARROW", value: "->", location: { startLine: line, startColumn: startCol, endLine: line, endColumn: startCol + 2 } });
      pos += 2; col += 2; continue;
    }

    if (ch === "|") {
      tokens.push({ type: "PIPE", value: "|", location: { startLine: line, startColumn: startCol, endLine: line, endColumn: startCol + 1 } });
      pos++; col++; continue;
    }

    if (ch === ":") {
      tokens.push({ type: "COLON", value: ":", location: { startLine: line, startColumn: startCol, endLine: line, endColumn: startCol + 1 } });
      pos++; col++; continue;
    }

    // P followed by a digit is a PRIORITY token (P1..P9), not an identifier
    if (ch === "P" && pos + 1 < source.length && source[pos + 1] >= "0" && source[pos + 1] <= "9") {
      tokens.push({ type: "PRIORITY", value: source.slice(pos, pos + 2), location: { startLine: line, startColumn: startCol, endLine: line, endColumn: startCol + 2 } });
      pos += 2; col += 2; continue;
    }

    if ((ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z")) {
      let end = pos;
      while (end < source.length && /[A-Za-z0-9_]/.test(source[end])) end++;
      const value = source.slice(pos, end);
      const type: TokenType = CORE.has(value) ? "KEYWORD" : "IDENTIFIER";
      tokens.push({ type, value, location: { startLine: line, startColumn: startCol, endLine: line, endColumn: startCol + value.length } });
      col += value.length; pos = end; continue;
    }

    pos++; col++;
  }

  tokens.push({ type: "EOF", value: "", location: { startLine: line, startColumn: col, endLine: line, endColumn: col } });
  return { tokens };
}
