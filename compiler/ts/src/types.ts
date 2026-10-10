export interface Location {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export type TokenType =
  | "KEYWORD" | "IDENTIFIER" | "ARROW" | "OUTPUT_ARROW"
  | "COLON" | "PIPE" | "PRIORITY" | "STRING" | "NUMBER" | "NEWLINE" | "EOF";

export interface Token {
  type: TokenType;
  value: string;
  location: Location;
}

export interface TokensOutput {
  tokens: Token[];
  diagnostics: Diagnostic[];
}

export interface ASTOperator {
  type: "Operator";
  value: string;
  location: Location;
}

export interface ASTIdentifier {
  type: "Identifier";
  value: string;
  location: Location;
}

export interface ASTModifier {
  type: "Modifier";
  name: string;
  value: string;
  location: Location;
}

export interface ASTConstraint {
  type: "Constraint";
  priority?: string;
  name: string;
  value: string;
  location: Location;
  nameLocation: Location;
}

export interface ASTOutputContract {
  type: "OutputContract";
  format: string;
  location: Location;
}

export interface ASTStatement {
  type: "Statement";
  operator: ASTOperator;
  target: ASTIdentifier;
  modifiers: ASTModifier[];
  constraints: ASTConstraint[];
  outputContract: ASTOutputContract;
}

export interface ASTProgram {
  type: "Program";
  body: ASTStatement[];
}

export interface SGNode {
  id: string;
  kind: "Action" | "Resource" | "Modifier" | "Constraint" | "Output";
  symbolId: string;
  attributes: Record<string, string>;
  location: Location;
}

export interface SGEdge {
  from: string;
  to: string;
  type: "TARGETS" | "HAS_MODIFIER" | "HAS_CONSTRAINT" | "PRODUCES";
}

export interface SGStatement {
  id: string;
  rootNode: string;
}

export interface SemanticGraph {
  nodes: SGNode[];
  edges: SGEdge[];
  statements: SGStatement[];
}

export interface EPINode {
  id: string;
  kind: "STEP";
  operation: string;
  capability: string;
  inputs: string[];
  outputs: string[];
}

export interface EPIEdge {
  from: string;
  to: string;
  type: string;
}

export interface ExecutionPlan {
  version: string;
  entryPoint: string;
  nodes: EPINode[];
  edges: EPIEdge[];
  requiredCapabilities: string[];
}

export interface RCDCapability {
  id: string;
  version: string;
  operations: string[];
}

export interface RCD {
  runtimeId: string;
  capabilities: RCDCapability[];
}

export interface AIRStep {
  step: number;
  action: string;
  target: string;
  modifiers: Record<string, string>;
}

export interface AIRConstraint {
  id: string;
  priority: number;
  type: string;
  rule: string;
  semantics: string;
}

export interface AIROutputContract {
  format: string;
  strictness: string;
}

export interface Diagnostic {
  code: string;
  severity: "error" | "warning" | "info";
  message: string;
  location?: Location;
}

export interface AIR {
  $schema: string;
  version: string;
  capabilities_required: string[];
  execution_pipeline: AIRStep[];
  constraints: AIRConstraint[];
  output_contract: AIROutputContract;
  diagnostics: unknown[];
}
