import { Diagnostic } from "./types";

export interface NormalizeResult {
  source: string;
  diagnostics: Diagnostic[];
}

// Block form markers per RFC-001 Appendix A and skill.source.md
const BLOCK_MARKERS = /^<System>|^\[.+\]|^"""|^---/m;

export function normalize(source: string): NormalizeResult {
  if (!BLOCK_MARKERS.test(source)) {
    return { source, diagnostics: [] };
  }

  // ponytail: block form key->operator mapping not frozen (RFC-001 Appendix A); pass through with warning
  return {
    source,
    diagnostics: [{
      code: "AIL-NORM-001",
      severity: "warning",
      message: "Block form input detected in Strict profile; key-to-operator mapping not yet frozen (RFC-001 Appendix A). No conformance guarantee.",
    }],
  };
}
