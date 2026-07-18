import { AIR } from "./types";

export type RuntimeId = "claude" | "openai" | "gemini" | "generic";

export interface AREPayload {
  runtimeId: RuntimeId;
  payload: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validate(air: AIR): ValidationResult {
  const errors: string[] = [];
  for (const d of air.diagnostics as Array<{ severity?: string; code?: string }>) {
    if (d.severity === "error") errors.push(d.code ?? "unknown error diagnostic");
  }
  return { valid: errors.length === 0, errors };
}

function reconstructDirective(air: AIR): string {
  const parts: string[] = [];

  for (const step of air.execution_pipeline) {
    const mods = Object.entries(step.modifiers)
      .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}:${v}`)
      .join(" ");

    const stepCons = air.constraints
      .filter((_, i) => i < air.constraints.length)
      .map(c => `P${c.priority} ${c.type}:${c.rule}`)
      .join(" ");

    const modPart = mods ? ` -> ${mods}` : "";
    const conPart = stepCons ? ` | ${stepCons}` : "";
    parts.push(`${step.action} ${step.target}${modPart}${conPart} => ${air.output_contract.format}`);
  }

  return parts.join("\n");
}

const AWF_SYSTEM_CONTEXT = "You are an execution unit operating under the Agentic Writing Format (AWF). Execute the following directive with zero preamble and maximum fidelity to stated constraints.";

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
    default:
      return {
        runtimeId: "generic",
        payload: { system: AWF_SYSTEM_CONTEXT, directive },
      };
  }
}
