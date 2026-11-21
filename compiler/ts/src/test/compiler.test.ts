import { test, describe } from "node:test";
import * as assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import { compileDetailed, compile } from "../pipeline";
import { emit, reconstructDirective } from "../pass015-are";
import { lex } from "../pass001-lex";
import { canonicalHash } from "../canonical";
import { RCD } from "../types";

const REPO = path.resolve(__dirname, "../../../..");
const GOLDEN = path.join(REPO, "tests/golden/extract-basic");
const readJson = (file: string): unknown => JSON.parse(fs.readFileSync(file, "utf8"));

const goldenRcd = readJson(path.join(GOLDEN, "rcd.json")) as RCD;
const defaultRcd = readJson(path.join(__dirname, "../../rcd/default.rcd.json")) as RCD;
const goldenSource = fs.readFileSync(path.join(GOLDEN, "input.awf"), "utf8");

const codes = (source: string, rcd = defaultRcd): string[] =>
  compileDetailed(source, rcd).diagnostics.map(d => d.code);

describe("golden fixture (RFC-009)", () => {
  const result = compileDetailed(goldenSource, goldenRcd);

  test("AIR hashes to the frozen value", () => {
    const expected = fs.readFileSync(path.join(GOLDEN, "air.sha256"), "utf8").split(/\s+/)[0];
    assert.equal(canonicalHash(result.air), expected);
  });

  test("tokens, semantic graph and execution plan match their snapshots", () => {
    assert.deepEqual(result.tokens, readJson(path.join(GOLDEN, "tokens.json")));
    assert.deepEqual(result.sg, readJson(path.join(GOLDEN, "semantic.graph.json")));
    assert.deepEqual(result.epi, readJson(path.join(GOLDEN, "execution.plan.json")));
  });

  test("AST matches its snapshot (ignoring the internal nameLocation helper)", () => {
    const ast = JSON.parse(JSON.stringify(result.ast, (k, v) => (k === "nameLocation" ? undefined : v)));
    assert.deepEqual(ast, readJson(path.join(GOLDEN, "ast.json")));
  });

  test("emitted directive round-trips to the same AIR", () => {
    const directive = reconstructDirective(result.air);
    assert.equal(canonicalHash(compile(directive, goldenRcd)), canonicalHash(result.air));
  });
});

describe("lexer", () => {
  test("reads quoted strings with escapes and numbers", () => {
    const { tokens, diagnostics } = lex('Rank X -> Limit:5 Note:"say \\"hi\\"" => Table');
    assert.deepEqual(diagnostics, []);
    assert.deepEqual(tokens.find(t => t.type === "NUMBER")?.value, "5");
    assert.deepEqual(tokens.find(t => t.type === "STRING")?.value, 'say "hi"');
  });

  test("keeps P2Pnet an identifier, not a priority", () => {
    assert.equal(lex("P2Pnet").tokens[0].type, "IDENTIFIER");
  });

  test("reports unknown characters and out-of-range priorities", () => {
    assert.deepEqual(lex("Extract X -> A:B @").diagnostics.map(d => d.code), ["AIL-LEX-001"]);
    assert.deepEqual(lex("| P7 Lock:X").diagnostics.map(d => d.code), ["AIL-LEX-001"]);
  });
});

describe("parser recovery", () => {
  test("a bad line is reported and the good lines still compile", () => {
    const result = compileDetailed(
      "Extract -> Depth:Critical => JSON\nSummarize Report -> Audience:Execs => JSON",
      defaultRcd,
    );
    assert.deepEqual(result.diagnostics.map(d => d.code), ["AIL-PARSE-002"]);
    assert.equal(result.ok, false);
    assert.equal(result.air.execution_pipeline.length, 1);
    assert.equal(result.air.execution_pipeline[0].action, "Summarize");
  });

  test("a missing output arrow does not swallow the next line", () => {
    const result = compileDetailed("Extract A -> X:Y\nSummarize B -> X:Y => JSON", defaultRcd);
    assert.deepEqual(result.diagnostics.map(d => d.code), ["AIL-PARSE-003"]);
    assert.equal(result.diagnostics[0].location?.startLine, 1);
    assert.equal(result.air.execution_pipeline[0].target, "B");
  });

  test("requires at least one modifier, per the grammar", () => {
    assert.deepEqual(codes("Summarize Doc -> => Markdown"), ["AIL-PARSE-003"]);
  });

  test("an empty program is an error", () => {
    assert.deepEqual(codes("   \n"), ["AIL-PARSE-003"]);
  });
});

describe("semantics", () => {
  test("multi-statement programs lower to ordered steps", () => {
    const air = compile("Extract Logs -> Depth:Critical => JSON\nSummarize Findings -> Length:Short => JSON", defaultRcd);
    assert.deepEqual(air.execution_pipeline.map(s => s.action), ["Extract", "Summarize"]);
    assert.deepEqual(air.capabilities_required, ["core.extract", "core.summarize"]);
  });

  test("mixed output formats warn (AIR v1 has one output contract)", () => {
    assert.deepEqual(codes("Extract A -> X:Y => JSON\nRank B -> By:Z => Table"), ["AIL-AIR-001"]);
  });

  test("extension operators warn, and fail capability resolution unless the RCD covers them", () => {
    assert.deepEqual(codes("Brainstorm Ideas -> Count:10 => Markdown"), ["AIL-CAP-003", "AIL-NAME-001"]);
    const rcd: RCD = { runtimeId: "x", capabilities: [{ id: "ext.brainstorm", version: "1", operations: ["AIL.OP.BRAINSTORM"] }] };
    assert.deepEqual(codes("Brainstorm Ideas -> Count:10 => Markdown", rcd), ["AIL-NAME-001"]);
  });

  test("capability ties resolve to the lexically first id (RFC-006)", () => {
    const rcd: RCD = {
      runtimeId: "x",
      capabilities: [
        { id: "zeta.extract", version: "1", operations: ["AIL.OP.EXTRACT"] },
        { id: "alpha.extract", version: "1", operations: ["AIL.OP.EXTRACT"] },
      ],
    };
    assert.deepEqual(compile("Extract A -> X:Y => JSON", rcd).capabilities_required, ["alpha.extract"]);
  });

  test("diagnostics carry their phase and are sorted by code (RFC-011)", () => {
    const { diagnostics } = compileDetailed("Brainstorm Ideas -> Count:10 => Markdown", defaultRcd);
    assert.deepEqual(diagnostics.map(d => d.phase), ["CAP", "NAME"]);
  });

  test("compilation is deterministic", () => {
    const source = "Extract Logs -> Depth:Critical | P1 Lock:RawJSON P2 Shield:PII => JSON";
    assert.equal(canonicalHash(compile(source, defaultRcd)), canonicalHash(compile(source, defaultRcd)));
  });
});

describe("ARE emission (RFC-007)", () => {
  test("refuses AIR that carries errors", () => {
    const air = compile("Extract -> X:Y => JSON", defaultRcd);
    assert.throws(() => emit(air, "claude"), /ARE refused/);
  });

  test("re-quotes string values so the directive stays valid AWF", () => {
    const air = compile('Summarize Doc -> Tone:"plain, warm" => Markdown', defaultRcd);
    const directive = reconstructDirective(air);
    assert.equal(directive, 'Summarize Doc -> Tone:"plain, warm" => Markdown');
    assert.deepEqual(compileDetailed(directive, defaultRcd).diagnostics, []);
  });

  test("shapes each provider payload", () => {
    const air = compile(goldenSource, goldenRcd);
    assert.ok((emit(air, "claude").payload as { messages: unknown[] }).messages.length === 1);
    assert.ok((emit(air, "openai").payload as { messages: unknown[] }).messages.length === 2);
    assert.ok("contents" in (emit(air, "gemini").payload as object));
    assert.ok("directive" in (emit(air, "generic").payload as object));
  });
});
