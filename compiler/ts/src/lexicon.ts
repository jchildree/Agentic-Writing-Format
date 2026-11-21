// Closed Core Lexicon (ADR-0001). Mirrors core-operators.json at the repo root.
// Membership changes are ADR-gated: do not edit casually.

export const CORE_ACTIONS: ReadonlySet<string> = new Set([
  "Extract", "Analyze", "Synthesize", "Generate", "Transform",
  "Compare", "Evaluate", "Convert", "Compress", "Expand",
  "Optimize", "Validate", "Summarize", "Translate", "Classify", "Rank",
]);

export const CORE_CONSTRAINTS: ReadonlySet<string> = new Set(["Lock", "Shield"]);

/** Every word the lexer reports as KEYWORD. */
export const CORE_KEYWORDS: ReadonlySet<string> = new Set([...CORE_ACTIONS, ...CORE_CONSTRAINTS]);
