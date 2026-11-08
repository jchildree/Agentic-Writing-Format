import { Diagnostic, Location, Token, TokenType, TokensOutput } from "./types";
import { CORE_KEYWORDS } from "./lexicon";
import { diag } from "./diagnostics";

// PASS-001 Lexing (RFC-001). Columns are 1-indexed, spans half-open [start, end).

export interface LexResult extends TokensOutput {
  diagnostics: Diagnostic[];
}

const isLetter = (ch: string): boolean => /[A-Za-z]/.test(ch);
const isDigit = (ch: string): boolean => ch >= "0" && ch <= "9";
const isWordChar = (ch: string | undefined): boolean => ch !== undefined && /[A-Za-z0-9_]/.test(ch);

export function lex(source: string): LexResult {
  const tokens: Token[] = [];
  const diagnostics: Diagnostic[] = [];
  let pos = 0;
  let line = 1;
  let col = 1;

  const span = (startCol: number, length: number): Location =>
    ({ startLine: line, startColumn: startCol, endLine: line, endColumn: startCol + length });

  const push = (type: TokenType, value: string, rawLength: number): void => {
    tokens.push({ type, value, location: span(col, rawLength) });
    pos += rawLength;
    col += rawLength;
  };

  while (pos < source.length) {
    const ch = source[pos];

    if (ch === " " || ch === "\t") { pos++; col++; continue; }

    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && source[pos + 1] === "\n") pos++;
      pos++; line++; col = 1;
      continue;
    }

    if (source.startsWith("=>", pos)) { push("OUTPUT_ARROW", "=>", 2); continue; }
    if (source.startsWith("->", pos)) { push("ARROW", "->", 2); continue; }
    if (ch === "|") { push("PIPE", "|", 1); continue; }
    if (ch === ":") { push("COLON", ":", 1); continue; }

    if (ch === '"') {
      const str = readString(source, pos);
      if (str.terminated) {
        push("STRING", str.value, str.rawLength);
      } else {
        diagnostics.push(diag("AIL-LEX-001", "error", "Unterminated string literal.", span(col, str.rawLength)));
        pos += str.rawLength; col += str.rawLength;
      }
      continue;
    }

    // `P` + one digit, standing alone, is a priority (P1..P5). `P2Pnet` stays an identifier.
    if (ch === "P" && isDigit(source[pos + 1] ?? "") && !isWordChar(source[pos + 2])) {
      const level = Number(source[pos + 1]);
      if (level < 1 || level > 5) {
        diagnostics.push(diag("AIL-LEX-001", "error", `Priority "P${level}" out of range; use P1..P5.`, span(col, 2)));
      }
      push("PRIORITY", source.slice(pos, pos + 2), 2);
      continue;
    }

    if (isLetter(ch)) {
      let end = pos;
      while (isWordChar(source[end])) end++;
      const word = source.slice(pos, end);
      push(CORE_KEYWORDS.has(word) ? "KEYWORD" : "IDENTIFIER", word, word.length);
      continue;
    }

    if (isDigit(ch)) {
      const match = /^[0-9]+(\.[0-9]+)?/.exec(source.slice(pos))!;
      push("NUMBER", match[0], match[0].length);
      continue;
    }

    diagnostics.push(diag("AIL-LEX-001", "error", `Unrecognized character "${ch}".`, span(col, 1)));
    pos++; col++;
  }

  tokens.push({ type: "EOF", value: "", location: span(col, 0) });
  return { tokens, diagnostics };
}

interface StringScan {
  value: string;
  rawLength: number;
  terminated: boolean;
}

/** Reads a `"..."` literal starting at `start`. Supports `\"` and `\\`. Strings never span lines. */
function readString(source: string, start: number): StringScan {
  let value = "";
  let pos = start + 1;
  while (pos < source.length) {
    const ch = source[pos];
    if (ch === "\n" || ch === "\r") break;
    if (ch === '"') return { value, rawLength: pos + 1 - start, terminated: true };
    if (ch === "\\" && (source[pos + 1] === '"' || source[pos + 1] === "\\")) {
      value += source[pos + 1];
      pos += 2;
      continue;
    }
    value += ch;
    pos++;
  }
  return { value, rawLength: pos - start, terminated: false };
}
