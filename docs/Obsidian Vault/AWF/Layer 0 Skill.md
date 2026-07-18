# Layer 0 Skill

Portable authoring format + LLM skill. Shippable now. No compiler required.

## How It Works

Single normative source (`skill/skill.source.md`) generated into runtime adapters via `python3 skill/generate.py`.

Adapters: Claude (`skill/adapters/claude/SKILL.md`), OpenAI (`skill/adapters/openai/system-prompt.md`), Gemini (`skill/adapters/gemini/system-instruction.md`), Generic (`skill/adapters/generic/AGENTS.md`).

Each adapter is provenance-stamped with a SHA-256 digest. Never hand-edit adapters -- edit the source and regenerate.

## Runtime Profile (Lenient)

Reduced pass subset: 001 Lex, 002 Parse, 003 Normalize, 005 Name Resolution, 006 Semantic Bind, 009 Constraint Resolution -- then execute directly. No optimization, EPI, AIR, or ARE.

Extension Operators interpreted via advisory lexicon (not hard-errored).

## Related

[[AWF Index]]
[[ADR-0005 Skill Source and Adapters]]
[[Layer 1 Compiler]]
