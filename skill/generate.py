#!/usr/bin/env python3
"""Generate per-runtime AWF skill adapters from the single normative source.

ADR-0005: adapters are generated, provenance-stamped, and never hand-edited.
Usage:  python3 skill/generate.py
"""
import hashlib, pathlib

HERE = pathlib.Path(__file__).resolve().parent
SOURCE = HERE / "skill.source.md"
body = SOURCE.read_text()
digest = hashlib.sha256(body.encode("utf-8")).hexdigest()[:12]
prov = f"generated from skill/skill.source.md@{digest} - do not edit"

def strip_source_header(md: str) -> str:
    out, skip = [], False
    for line in md.splitlines():
        if line.strip().startswith("<!--"):
            skip = True
        if not skip:
            out.append(line)
        if "-->" in line:
            skip = False
    return "\n".join(out).strip() + "\n"

core = strip_source_header(body)

targets = {
    "claude/SKILL.md":
        f"---\nname: agentic-writing-format\ndescription: >-\n  Execute requests under the Agentic Writing Format (Lenient runtime profile):\n  high-density directives, zero preamble, strict constraint fidelity.\n---\n\n<!-- {prov} -->\n\n{core}",
    "openai/system-prompt.md":
        f"<!-- {prov} -->\n<!-- Load as the `system` message. -->\n\n{core}",
    "gemini/system-instruction.md":
        f"<!-- {prov} -->\n<!-- Load as `system_instruction`. -->\n\n{core}",
    "generic/AGENTS.md":
        f"<!-- {prov} -->\n<!-- Runtime-neutral. Load as project/agent instructions for any LLM. -->\n\n{core}",
}

for rel, text in targets.items():
    dest = HERE / "adapters" / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(text)
    print("generated", dest.relative_to(HERE.parent))

print(f"provenance hash: {digest}")
