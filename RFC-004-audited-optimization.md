# RFC-004 — Audited Optimization & Risk Scoring

**Status:** Draft (v1.0.0) · **Layer:** 1 (PASS-010)

## Model
```
type SemanticRiskLevel = "none" | "low" | "medium" | "high" | "unknown";
interface OptimizationDecision {
  transformation: string; confidence: number;   // 0.00-1.00
  semanticRisk: SemanticRiskLevel; applied: boolean; diagnosticCode?: string;
}
```

## Rules
- **Apply** iff `confidence >= 0.95` AND `semanticRisk == "none"`.
- **Abort & log** iff `semanticRisk in {"high","unknown"}` OR `confidence < 0.90`;
  original context is preserved and `AIL-OPT-006` is emitted.

The 5th state `"unknown"` forces ambiguous transforms to fail safe. Optimization
annotates but never mutates SG topology.
