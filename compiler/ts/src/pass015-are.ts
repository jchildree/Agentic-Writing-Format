import { AIR, AIRConstraint, AIRStep } from "./types";

// PASS-015 ARE Emission (RFC-007): AIR -> provider payload.

export const RUNTIME_IDS = ["claude", "openai", "gemini", "generic"] as const;
export type RuntimeId = typeof RUNTIME_IDS[number];

export interface AREPayload {
  runtimeId: RuntimeId;
  payload: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const AWF_SYSTEM_CONTEXT =
  "You are an execution unit operating under the Agentic Writing Format (AWF). " +
  "Execute the following directive with zero preamble and maximum fidelity to stated constraints.";

export function isRuntimeId(value: string): value is RuntimeId {
  return (RUNTIME_IDS as readonly string[]).includes(value);
}

/** RFC-007: an emitter MUST refuse AIR that carries any error-severity diagnostic. */
export function validate(air: AIR): ValidationResult {
  const errors = air.diagnostics.filter(d => d.severity === "error").map(d => d.code);
  return { valid: errors.length === 0, errors };
}

/** Values that are not bare identifiers/numbers are re-quoted so the directive stays valid AWF. */
function formatValue(value: string): string {
  if (/^[A-Za-z][A-Za-z0-9_]*$/.test(value) || /^[0-9]+(\.[0-9]+)?$/.test(value)) return value;
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function capitalize(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function formatConstraint(c: AIRConstraint): string {
  const priority = c.priority > 0 ? `P${c.priority} ` : "";
  return `${priority}${c.type}:${formatValue(c.rule)}`;
}

/**
 * Rebuilds canonical operator-form AWF from AIR. AIR v1 constraints and output
 * contract are program-wide, so each step carries all of them.
 */
export function reconstructDirective(air: AIR): string {
  const constraintPart = air.constraints.length
    ? ` | ${air.constraints.map(formatConstraint).join(" ")}`
    : "";

  return air.execution_pipeline
    .map((step: AIRStep) => {
      const mods = Object.entries(step.modifiers)
        .map(([key, value]) => `${capitalize(key)}:${formatValue(value)}`)
        .join(" ");
      return `${step.action} ${step.target} -> ${mods}${constraintPart} => ${air.output_contract.format}`;
    })
    .join("\n");
}

export function emit(air: AIR, runtimeId: RuntimeId): AREPayload {
  const result = validate(air);
  if (!result.valid) throw new Error(`ARE refused: error diagnostics present: ${result.errors.join(", ")}`);

  const directive = reconstructDirective(air);

  switch (runtimeId) {
    case "claude":
      return {
        runtimeId,
        payload: {
          system: AWF_SYSTEM_CONTEXT,
          messages: [{ role: "user", content: directive }],
        },
      };

    case "openai":
      return {
        runtimeId,
        payload: {
          messages: [
            { role: "system", content: AWF_SYSTEM_CONTEXT },
            { role: "user", content: directive },
          ],
        },
      };

    case "gemini":
      return {
        runtimeId,
        payload: {
          system_instruction: { parts: [{ text: AWF_SYSTEM_CONTEXT }] },
          contents: [{ role: "user", parts: [{ text: directive }] }],
        },
      };

    case "generic":
      return {
        runtimeId,
        payload: { system: AWF_SYSTEM_CONTEXT, directive },
      };
  }
}
