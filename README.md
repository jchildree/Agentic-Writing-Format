# Agentic Writing Format (AWF)

> One contract, two readers. A portable standard for human-to-agent instruction
> that any model can speak today -- and a deterministic compiler it can grow into.

AWF is a model-agnostic standard for writing dense, unambiguous, token-efficient
instructions to AI agents. It ships in two layers that share **one** normative
spec, so they can never quietly drift apart.

## The two layers

| Layer | What it is | Ships | Needs a compiler? |
|-------|------------|-------|-------------------|
| **Layer 0 -- Standard + Skill** | A portable authoring standard and a runtime-neutral Agent Skill any LLM loads. | Now | No |
| **Layer 1 -- AIL Compiler** | An optional deterministic toolchain: `AWF -> AST -> Semantic Graph -> EPI -> AIR -> provider payload`. | Now (TypeScript reference + `awf` CLI) | Yes |

Layer 1 depends on Layer 0's spec. Layer 0 depends on nothing. That's the seam.

## Quickstart (Layer 0)

Load a skill adapter for your runtime and start writing directives:

- **Claude** -- [`skill/adapters/claude/SKILL.md`](skill/adapters/claude/SKILL.md)
- **OpenAI** -- [`skill/adapters/openai/system-prompt.md`](skill/adapters/openai/system-prompt.md)
- **Gemini** -- [`skill/adapters/gemini/system-instruction.md`](skill/adapters/gemini/system-instruction.md)
- **Any LLM** -- [`skill/adapters/generic/AGENTS.md`](skill/adapters/generic/AGENTS.md)

All four are **generated** from one source -- [`skill/skill.source.md`](skill/skill.source.md).
Edit the source, run `python3 skill/generate.py`, adapters regenerate with a fresh
provenance stamp. (ADR-0005.)

## Quickstart (Layer 1)

```bash
cd compiler/ts && npm install && npm test
node dist/cli.js compile ../../examples/exec-brief.awf --emit claude
node dist/cli.js check ../../examples/*.awf
```

The `awf` CLI compiles to AIR or straight to a Claude, OpenAI, Gemini, or generic
payload, and reports diagnostics with source excerpts. See
[`compiler/ts/README.md`](compiler/ts/README.md) and [`examples/`](examples/).

## Canonical example

```awf
Extract SystemLogs -> Depth:Critical | P1 Lock:RawJSON => JSON
```

That single line is the frozen golden fixture. Its full pipeline snapshots live in
[`tests/golden/extract-basic/`](tests/golden/extract-basic/), and its canonical AIR
hashes to:

```
f20f4ba7cb26a7408ea51d3a48e447d7d98160567199f9bae6b4617a7ee4fb7a
```

Recompute it yourself: `python3 canonicalize.py tests/golden/extract-basic/air.json`

## Repository map

```
PROTOCOL.md           the master design protocol (start here)
0001..0006-*.md       the six load-bearing decisions (ADRs)
RFC-001..012-*.md     the normative RFC suite
awf.ebnf, *.json      grammar, lexicon, diagnostics registry, JSON schemas
skill/                Layer 0 - source + generated adapters
compiler/ts/          Layer 1 - TypeScript reference compiler + `awf` CLI
examples/             ready-to-compile .awf directives
tests/golden/         the single canonical fixture, byte-reproducible
CONTEXT.md            the glossary (single source of terms)
```

## Status

Layer 0: **standard frozen, skill shippable.** Layer 1: **TypeScript reference compiler
usable**: all 15 passes wired, conformance hash reproduced, CLI and tests in CI. Passes
004, 010, and 012 are no-ops until their RFCs define content. The Rust engine is still
unstarted. See [`PROTOCOL.md`](PROTOCOL.md) for the whole picture.

## License

MIT. Build on it, ship it, remix it.
