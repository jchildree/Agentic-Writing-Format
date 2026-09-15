# Domain Docs

Layout: single-context.

`CONTEXT.md` at repo root is the sole glossary -- there is no `CONTEXT-MAP.md` and no
per-context split. ADRs live at `docs/adr/0001-*.md` through `docs/adr/0006-*.md`;
RFCs live at `docs/rfc/RFC-001-*.md` through `docs/rfc/RFC-012-*.md`.

## Consumer Rules

- `CONTEXT.md` is the single source of term definitions -- never redefine terms inline.
- ADRs are normative and closed -- do not contradict them without a new ADR.
- RFCs are normative specs -- do not contradict them without an RFC update.
