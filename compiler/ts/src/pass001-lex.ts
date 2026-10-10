import { Diagnostic, Token, TokenType, TokensOutput } from "./types";

const CORE = new Set([
  "Extract","Analyze","Synthesize","Generate","Transform",
  "Compare","Evaluate","Convert","Compress","Expand",
  "Optimize","Validate","Summarize","Translate","Classify","Rank",
  "Lock","Shield",
]);

export function lex(source: string): TokensOutput {
  const tokens: Token[] = [];
  const diagnostics: Diagnostic[] = [];
  let pos = 0;
  let line = 1;
  let col = 1;

  while (pos < source.length) {
    const startCol = col;
    const startLine = line;
    const ch = source[pos];

    if (ch === " " || ch === "\t") { pos++; col++; continue; }

    if (ch === "\n" || ch === "\r") {
      let len = 1;
      if (ch === "\r" && source[pos + 1] === "\n") len = 2;
      tokens.push({ type: "NEWLINE", value: source.slice(pos, pos + len), location: { startLine, startColumn: startCol, endLine: startLine, endColumn: startCol + len } });
      pos += len; line++; col = 1;
      continue;
    }

    if (ch === "\"") {
      let end = pos + 1;
      let value = "";
      while (end < source.length && source[end] !== "\"") {
        if (source[end] === "\\" && end + 1 < source.length) { value += source[end + 1]; end += 2; continue; }
        value += source[end];
        end++;
      }
      const closed = source[end] === "\"";
      const len = (closed ? end + 1 : end) - pos;
      if (!closed) {
        diagnostics.push({ code: "AIL-LEX-001", severity: "error", message: `Unterminated string literal.`, location: { startLine, startColumn: startCol, endLine: line, endColumn: startCol + len } });
      }
      tokens.push({ type: "STRING", value, location: { startLine, startColumn: startCol, endLine: line, endColumn: startCol + len } });
      pos += len; col += len; continue;
    }

    if (ch >= "0" && ch <= "9") {
      let end = pos;
      while (end < source.length && source[end] >= "0" && source[end] <= "9") end++;
      if (source[end] === "." && source[end + 1] >= "0" && source[end + 1] <= "9") {
        end++;
        while (end < source.length && source[end] >= "0" && source[end] <= "9") end++;
      }
      const value = source.slice(pos, end);
      tokens.push({ type: "NUMBER", value, location: { startLine, startColumn: startCol, endLine: line, endColumn: startCol + value.length } });
      col += value.length; pos = end; continue;
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

    diagnostics.push({
      code: "AIL-LEX-001",
      severity: "error",
      message: `Malformed or unrecognized token "${ch}".`,
      location: { startLine: line, startColumn: startCol, endLine: line, endColumn: startCol + 1 },
    });
    pos++; col++;
  }

  tokens.push({ type: "EOF", value: "", location: { startLine: line, startColumn: col, endLine: line, endColumn: col } });
  return { tokens, diagnostics };
}
