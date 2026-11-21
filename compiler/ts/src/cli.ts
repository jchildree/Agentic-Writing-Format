#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { compileDetailed } from "./pipeline";
import { emit, isRuntimeId, RUNTIME_IDS } from "./pass015-are";
import { canonicalHash } from "./canonical";
import { Diagnostic, RCD } from "./types";

// `awf` command-line front door for the reference compiler.

const VERSION = "0.2.0";
const DEFAULT_RCD = path.resolve(__dirname, "../rcd/default.rcd.json");
const STAGES = ["tokens", "ast", "sg", "epi", "air"] as const;
type Stage = typeof STAGES[number];

const HELP = `awf ${VERSION} - Agentic Writing Format reference compiler

Usage:
  awf compile <file|-> [--emit <runtime>] [--stage <stage>] [--rcd <path>] [--out <path>]
  awf check   <file...>                   [--rcd <path>]
  awf hash    <air.json...>
  awf help | --version

Commands:
  compile   Compile AWF to AIR (default) or a provider payload (--emit).
  check     Report diagnostics only. Exits 1 if any file has errors.
  hash      Print the RFC-012 canonical SHA-256 of AIR JSON files.

Options:
  --emit <runtime>  ${RUNTIME_IDS.join(" | ")}
  --stage <stage>   ${STAGES.join(" | ")}   (default: air)
  --rcd <path>      Runtime Capability Descriptor (default: all 16 Core Actions)
  --out <path>      Write output to a file instead of stdout

Example:
  echo 'Summarize Report -> Audience:Executives | P1 Lock:Bullets => Markdown' | awf compile - --emit claude
`;

// ---------------------------------------------------------------- terminal styling

const useColor = process.stderr.isTTY && !process.env.NO_COLOR;
const paint = (code: number) => (text: string): string => (useColor ? `\x1b[${code}m${text}\x1b[0m` : text);
const style = { red: paint(31), green: paint(32), yellow: paint(33), cyan: paint(36), dim: paint(2), bold: paint(1) };

const SEVERITY_STYLE: Record<Diagnostic["severity"], (s: string) => string> = {
  error: style.red,
  warning: style.yellow,
  info: style.cyan,
};

// ---------------------------------------------------------------- argument parsing

interface Args {
  command: string;
  files: string[];
  options: Record<string, string>;
}

const VALUE_OPTIONS = new Set(["--emit", "--stage", "--rcd", "--out"]);

function parseArgs(argv: string[]): Args {
  const [command = "help", ...rest] = argv;
  const files: string[] = [];
  const options: Record<string, string> = {};

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (VALUE_OPTIONS.has(arg)) {
      const value = rest[++i];
      if (value === undefined) throw new UsageError(`${arg} needs a value.`);
      options[arg.slice(2)] = value;
    } else if (arg.startsWith("--")) {
      throw new UsageError(`Unknown option ${arg}.`);
    } else {
      files.push(arg);
    }
  }
  return { command, files, options };
}

class UsageError extends Error {}

// ---------------------------------------------------------------- I/O helpers

function readInput(file: string): string {
  return file === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(file, "utf8");
}

function loadRcd(rcdPath = DEFAULT_RCD): RCD {
  const rcd = JSON.parse(fs.readFileSync(rcdPath, "utf8")) as RCD;
  if (typeof rcd.runtimeId !== "string" || !Array.isArray(rcd.capabilities)) {
    throw new UsageError(`${rcdPath} is not a Runtime Capability Descriptor (needs runtimeId and capabilities).`);
  }
  return rcd;
}

function writeOutput(text: string, outPath?: string): void {
  if (outPath) fs.writeFileSync(outPath, text);
  else process.stdout.write(text);
}

function toJson(value: unknown): string {
  return JSON.stringify(value, null, 2) + "\n";
}

// ---------------------------------------------------------------- diagnostics rendering

function renderDiagnostic(d: Diagnostic, file: string, sourceLines: string[]): string {
  const where = d.location ? `${file}:${d.location.startLine}:${d.location.startColumn}` : file;
  const header = `${style.bold(where)}  ${SEVERITY_STYLE[d.severity](d.severity)}  ${style.cyan(d.code)}  ${d.message}`;
  if (!d.location) return header;

  const { startLine, startColumn, endLine, endColumn } = d.location;
  const lineText = sourceLines[startLine - 1] ?? "";
  const width = endLine === startLine ? Math.max(1, endColumn - startColumn) : 1;
  const gutter = String(startLine);
  const pad = " ".repeat(gutter.length);

  return [
    header,
    style.dim(`  ${gutter} | `) + lineText,
    style.dim(`  ${pad} | `) + " ".repeat(startColumn - 1) + SEVERITY_STYLE[d.severity]("^".repeat(width)),
  ].join("\n");
}

function reportDiagnostics(diagnostics: Diagnostic[], file: string, source: string): void {
  const lines = source.replace(/^﻿/, "").split(/\r?\n/);
  // AIR keeps RFC-011 order (by code); people read top-to-bottom, so show by position.
  const byPosition = [...diagnostics].sort((a, b) =>
    (a.location?.startLine ?? 0) - (b.location?.startLine ?? 0) ||
    (a.location?.startColumn ?? 0) - (b.location?.startColumn ?? 0));
  for (const d of byPosition) console.error(renderDiagnostic(d, file, lines) + "\n");
}

function summary(diagnostics: Diagnostic[]): string {
  const errors = diagnostics.filter(d => d.severity === "error").length;
  const warnings = diagnostics.filter(d => d.severity === "warning").length;
  return `${errors} error(s), ${warnings} warning(s)`;
}

// ---------------------------------------------------------------- commands

function runCompile(args: Args): number {
  if (args.files.length !== 1) throw new UsageError("compile takes exactly one input file (or - for stdin).");
  const [file] = args.files;
  const { emit: runtime, stage = "air", rcd: rcdPath, out } = args.options;

  if (!(STAGES as readonly string[]).includes(stage)) throw new UsageError(`--stage must be one of: ${STAGES.join(", ")}.`);
  if (runtime !== undefined && !isRuntimeId(runtime)) throw new UsageError(`--emit must be one of: ${RUNTIME_IDS.join(", ")}.`);
  if (runtime !== undefined && args.options.stage) throw new UsageError("Use either --emit or --stage, not both.");

  const source = readInput(file);
  const result = compileDetailed(source, loadRcd(rcdPath));
  reportDiagnostics(result.diagnostics, file, source);

  if (!result.ok) {
    console.error(style.red(`✖ ${file}: ${summary(result.diagnostics)} - nothing emitted.`));
    return 1;
  }

  const output = runtime ? emit(result.air, runtime) : result[stage as Stage];
  writeOutput(toJson(output), out);
  console.error(style.green(`✔ ${file} compiled`) + style.dim(` (${summary(result.diagnostics)})`));
  return 0;
}

function runCheck(args: Args): number {
  if (args.files.length === 0) throw new UsageError("check needs at least one input file.");
  const rcd = loadRcd(args.options.rcd);
  let failed = 0;

  for (const file of args.files) {
    const source = readInput(file);
    const { ok, diagnostics } = compileDetailed(source, rcd);
    reportDiagnostics(diagnostics, file, source);
    if (ok) console.error(style.green(`✔ ${file}`) + style.dim(` (${summary(diagnostics)})`));
    else { console.error(style.red(`✖ ${file}: ${summary(diagnostics)}`)); failed++; }
  }
  return failed > 0 ? 1 : 0;
}

function runHash(args: Args): number {
  if (args.files.length === 0) throw new UsageError("hash needs at least one AIR JSON file.");
  for (const file of args.files) {
    console.log(`${canonicalHash(JSON.parse(readInput(file)))}  ${file}`);
  }
  return 0;
}

function main(argv: string[]): number {
  try {
    const args = parseArgs(argv);
    switch (args.command) {
      case "compile": return runCompile(args);
      case "check": return runCheck(args);
      case "hash": return runHash(args);
      case "--version": case "-v": console.log(VERSION); return 0;
      case "help": case "--help": case "-h": console.log(HELP); return 0;
      default: throw new UsageError(`Unknown command "${args.command}".`);
    }
  } catch (err) {
    if (err instanceof UsageError) {
      console.error(style.red(`awf: ${err.message}`) + "\nRun `awf help` for usage.");
      return 2;
    }
    console.error(style.red(`awf: ${(err as Error).message}`));
    return 1;
  }
}

process.exitCode = main(process.argv.slice(2));
