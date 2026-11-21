# AWF examples

Small, real-world directives that compile cleanly with the reference compiler.

```bash
cd compiler/ts && npm install && npm run build
node dist/cli.js check ../../examples/*.awf
node dist/cli.js compile ../../examples/exec-brief.awf --emit claude
```

| File | Shows |
|------|-------|
| `exec-brief.awf` | Quoted string values, a P1 `Lock` constraint |
| `incident-triage.awf` | A three-step pipeline with `Shield`, numbers, and priorities |
| `code-review.awf` | Two analysis steps feeding one Markdown report |

All statements in a file share one output format: AIR v1 carries a single output
contract, and mixing formats raises `AIL-AIR-001`.
