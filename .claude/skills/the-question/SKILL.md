---
name: the-question
description: >-
  AWF's issue tracker. Use to open a new issue against the spec
  (`/the-question <description>`) or to review open issues against a spec
  section, ADR, or RFC (`/the-question <spec section>`). No external
  tracker -- issues live in docs/agents/issues.md.
---

# The Question

AWF has no external issue tracker. Issues are opened and reviewed entirely
through this skill, by interrogating the report against the spec rather than
recording it at face value, and persisted to `docs/agents/issues.md`.

## Creating an issue

Invoked as `/the-question <issue description>`.

1. Read `CONTEXT.md` and the decision index in `docs/PROTOCOL.md`; open
   whichever ADR(s) in `docs/adr/` or RFC(s) in `docs/rfc/` plausibly govern
   the reported behavior.
2. Interrogate the description before recording it -- do not transcribe it
   as given. Work out, and ask the reporter directly wherever the answer
   isn't already evident from the spec:
   - Which ADR or RFC governs this, if any? If the report contradicts a
     **closed** ADR, it needs a new ADR, not a fix -- say so and stop short
     of filing it as an ordinary bug.
   - Layer 0, Layer 1, or both?
   - Does it touch the golden fixture (`tests/golden/extract-basic/`)? If a
     fix would change `air.json`, flag it as a breaking spec change up
     front, per the golden-fixture invariant in `CLAUDE.md`.
   - What's the smallest input that reproduces it?
3. Append one row to the table in `docs/agents/issues.md` (create the file
   from the template below if it doesn't exist yet) with the next sequential
   `ISSUE-NNN` id, status `open`, the governing spec section, and the
   sharpened description from step 2 -- not the raw report.

## Reviewing issues

Invoked as `/the-question <spec section, ADR id, or RFC id>`.

1. Read `docs/agents/issues.md`.
2. Filter to rows whose spec section matches the argument, by ADR/RFC number
   or by the `CONTEXT.md` term it names.
3. For each match, interrogate rather than rubber-stamp:
   - Is it still reproducible against the current spec text?
   - Does the cited section actually say what the issue claims it says?
   - Is it a duplicate of another open row?
   - Has an ADR or RFC change since closed the question?
4. Report findings to the reporter and propose a status transition per row
   (`open` -> `resolved` | `wontfix` | `superseded`, per the triage
   vocabulary in `docs/agents/triage-labels.md` where it maps cleanly).
   Apply the change to `docs/agents/issues.md` only after the reporter
   confirms -- this skill does not close issues unilaterally.

## `docs/agents/issues.md` format

```markdown
| ID | Status | Spec section | Description |
|----|--------|---------------|-------------|
| ISSUE-001 | open | ADR-0003 | ... |
```

Status is one of `open`, `resolved`, `wontfix`, `superseded`. IDs are
sequential and never reused, even for a `wontfix` row.
