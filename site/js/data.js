/*
 * GreenSide Gaming — world data.
 *
 * Every quest card, realm and codex entry on the site is rendered from this
 * file. To add a project: append an object to QUESTS. To change a status:
 * edit its `stage` (1-5) and `status` text. Nothing else needs touching.
 */

/** Stages a project moves through. A quest's `stage` indexes into this list. */
export const STAGES = [
  { level: 1, name: "Sealed Scroll" },  // idea / planning
  { level: 2, name: "Blueprint" },      // spec + design locked
  { level: 3, name: "In the Forge" },   // actively being built
  { level: 4, name: "Wieldable" },      // usable today
  { level: 5, name: "Cleared" },        // shipped / done
];

/** The four regions of the world map. `hue` drives each realm's accent color. */
export const REALMS = [
  {
    id: "arcade",
    name: "The Arcade",
    glyph: "◆",
    hue: "var(--realm-arcade)",
    blurb: "Games, game jams, and the things that make people play together.",
  },
  {
    id: "forge",
    name: "The Forge",
    glyph: "▲",
    hue: "var(--realm-forge)",
    blurb: "Engines and compilers. Where intent becomes something deterministic.",
  },
  {
    id: "guild",
    name: "The Agent Guild",
    glyph: "✦",
    hue: "var(--realm-guild)",
    blurb: "AI agents with jobs, discipline, and someone else checking their work.",
  },
  {
    id: "homestead",
    name: "The Homestead",
    glyph: "●",
    hue: "var(--realm-homestead)",
    blurb: "Tools for real life: family, quality, and components on the fridge door.",
  },
];

/**
 * Projects. `repo` is only set for public repositories, so visitors never
 * land on a 404. `play` is an optional live link.
 */
export const QUESTS = [
  // ── The Arcade ────────────────────────────────────────────────
  {
    id: "solstice",
    realm: "arcade",
    title: "Solstice Game Jam '26",
    hook: "The sun decides where you can stand.",
    body: "A speedrun platformer built in Godot for a game jam. Toggle day and night to make platforms appear or vanish, then chain wall jumps and dashes into the fastest route before the dusk timer runs out. Your best times go on an online leaderboard.",
    tech: ["Godot 4", "GDScript", "SilentWolf"],
    stage: 5,
    status: "Shipped · playable in browser",
    repo: "https://github.com/jchildree/Solatice-Gam-Jam-26",
    play: "https://jchildree.itch.io/solitice-game-jam-26",
  },
  {
    id: "night-catchers",
    realm: "arcade",
    title: "Night Catchers",
    hook: "Monsters are immortal friends.",
    body: "An Android augmented-reality app where kids go monster hunting at night and then raise what they catch as pets. It's built to be whimsical but never childish, readable in the dark, and free of death or punishment. The bond with the monster is the reward.",
    tech: ["Kotlin", "Jetpack Compose", "ARCore", "GLSL"],
    stage: 3,
    status: "Design guide v1.1 · building",
    repo: "https://github.com/jchildree/Night-Catchers",
  },
  {
    id: "colosseum",
    realm: "arcade",
    title: "The Colosseum",
    hook: "Run the whole tourney from one window.",
    body: "A desktop app for running custom video game tournaments from start to finish. It covers setup, a Sleeper-style draft board with a pick-wheel randomizer, and a Challonge bracket push. It also updates the signup form automatically, so nobody has to edit it by hand.",
    tech: ["Electron", "React", "TypeScript", "Challonge API"],
    stage: 3,
    status: "In the forge",
    repo: "https://github.com/jchildree/The-Colosseum",
  },
  {
    id: "spin",
    realm: "arcade",
    title: "Very Serious Game: SPIN",
    hook: "Extremely serious. Classified, even.",
    body: "A game in the planning stage. The vault and the ADR index are set up, but the design hasn't been revealed yet.",
    tech: ["TBA"],
    stage: 1,
    status: "Sealed scroll",
    repo: "https://github.com/jchildree/VerySeriousGameSPIN",
  },

  // ── The Forge ─────────────────────────────────────────────────
  {
    id: "ngon",
    realm: "forge",
    title: "NgonENGINE",
    hook: "The triangle is a delivery format, not a worldview.",
    body: "A GPU-native geometry system that keeps n-gon polygons intact instead of breaking them into triangles. Triangles only exist briefly inside GPU registers. One canonical model renders in six graphical eras, from TEXT through 8-bit to photoreal. Its architecture is built on Nen from Hunter × Hunter: Ten, Zetsu, Ren, Hatsu.",
    tech: ["C++", "Mesh Shaders", "AVX-512", "GJK+EPA"],
    stage: 3,
    status: "Phases 01–04 complete · 05 active",
  },
  {
    id: "awf",
    realm: "forge",
    title: "Agentic Writing Format",
    hook: "One contract, two readers.",
    body: "A model-agnostic standard for writing dense, unambiguous instructions for AI agents. Layer 0 is a skill that works with any LLM today. Layer 1 is a 15-pass deterministic compiler that has to reproduce a frozen golden hash byte for byte.",
    tech: ["Spec", "TypeScript", "Rust", "Python"],
    stage: 4,
    status: "Layer 0 shipping · Layer 1 spec-complete",
    repo: "https://github.com/jchildree/Agentic-Writing-Format",
  },
  {
    id: "spydr",
    realm: "forge",
    title: "SPYdr",
    hook: "Scraping & Pattern Yield → Distill & Render.",
    body: "A console synthesizer built like a compiler rather than a prompt-to-code generator. It scrapes reference sites, distills them into reusable recipes, runs those recipes through scored tournaments for each panel, and assembles multi-panel operator consoles. The LLM is just one input into a typed IR.",
    tech: ["Rust", "TypeScript", "Typed IR"],
    stage: 4,
    status: "v1 complete · Plans 1–40 merged",
  },

  // ── The Agent Guild ───────────────────────────────────────────
  {
    id: "aal",
    realm: "guild",
    title: "Agentic Assembly Line",
    hook: "Run the post office, not the overworked clerk.",
    body: "Each station on the line uses a different model provider: Gemini handles intake, Claude builds, and OpenAI runs QA. That way no model grades its own work. Stations hand off through sealed envelopes on disk, and a ledger tracks what each step cost.",
    tech: ["Node.js", "Docker", "Multi-provider"],
    stage: 3,
    status: "Heading toward commercial",
    repo: "https://github.com/jchildree/Agentic-Assembly-Line-System",
  },
  {
    id: "question",
    realm: "guild",
    title: "The Question",
    hook: "Who are you to ask me a question? I'm THE QUESTION!!!",
    body: "A Claude Code plugin built around Vic Sage. It gives you six skills for debugging, root-cause analysis, and architectural decisions. Every claim records its source, its method, and a confidence level.",
    tech: ["Claude Code plugin", "Markdown", "Obsidian"],
    stage: 4,
    status: "Installable from the marketplace",
    repo: "https://github.com/jchildree/The-QUESTION",
  },
  {
    id: "claude-itect",
    realm: "guild",
    title: "Claude-ITect Skill",
    hook: "One club, infinite tools, zero yak-shaving.",
    body: "A starter pack for Claude Code that saves you from configuring 54 things by hand. It installs 54 curated skills, 4 agent definitions, and caveman session hooks with a single command.",
    tech: ["Claude Code", "PowerShell", "Bash", "Node"],
    stage: 4,
    status: "54 skills · one-command install",
    repo: "https://github.com/jchildree/Claud-itect-Skill",
  },

  // ── The Homestead ─────────────────────────────────────────────
  {
    id: "chalkboard",
    realm: "homestead",
    title: "The Chalkboard",
    hook: "Household life, in one place.",
    body: "A family organization app that brings together the calendar, tasks, a cookbook, meal planning, shopping lists, a shared inbox, and health tracking. It has a native Android client, a Go and Postgres API, and self-hosted deployment.",
    tech: ["Kotlin", "Go", "PostgreSQL", "SwiftUI"],
    stage: 3,
    status: "Android primary · backend CI green",
  },
  {
    id: "fridge",
    realm: "homestead",
    title: "The Fridge",
    hook: "Every component deserves a spot on the door.",
    body: "An appliance for React components: open a .jsx file the same way you'd open an image. It resolves imports four levels deep and lets you edit freely in a patch layer, so nothing is written to your file until you explicitly commit. No cloud, ever.",
    tech: ["React", "PWA", "pnpm"],
    stage: 2,
    status: "Pre-alpha · 8 ADRs accepted",
    repo: "https://github.com/jchildree/The-Fridge",
  },
  {
    id: "qa-brain",
    realm: "homestead",
    title: "QA-Brain Console",
    hook: "Retire CAPA_FINAL_v3_USE_THIS_ONE.xlsx.",
    body: "A quality management console that tracks SOPs, CAPs, incidents, changes, audits, and training. It cross-links records, runs AI-assisted intake, and keeps a trash bin for the records you'll definitely want back.",
    tech: ["React", "Vite", "Express", "Markdown vault"],
    stage: 4,
    status: "Working app with tests",
    repo: "https://github.com/jchildree/QA-Brain-Console",
  },
  {
    id: "elevator",
    realm: "homestead",
    title: "Elevator Project",
    hook: "Tutorial zone: where it all started.",
    body: "A command-line elevator simulation that calculates travel time and visit order. It handles bad input gracefully. Every adventurer starts by clearing level one.",
    tech: ["Python"],
    stage: 5,
    status: "Cleared",
    repo: "https://github.com/jchildree/Elevator-Project",
  },
];

/**
 * The Codex: the beliefs that keep showing up across every repo.
 * `quests` lists the quest ids that embody each principle.
 */
export const CODEX = [
  {
    technique: "Ten · 纏",
    title: "Spec first, code second",
    text: "Locked specs, accepted ADRs, and frozen golden fixtures come first. The code implements the contract. The contract never just describes whatever the code happens to do.",
    quests: ["awf", "spydr", "ngon", "fridge"],
  },
  {
    technique: "Separate Eyes",
    title: "Nothing grades its own homework",
    text: "Different providers, different blind spots. A reviewer that watched the work get built is not really a reviewer.",
    quests: ["aal", "question"],
  },
  {
    technique: "The Faceless Method",
    title: "Investigate first, attribute everything",
    text: "The first answer is where you start, not where you stop. Every claim carries its source, its method, and how confident you are.",
    quests: ["question", "qa-brain"],
  },
  {
    technique: "Zetsu · 絶",
    title: "Determinism over vibes",
    text: "Same input, same output, byte for byte. The LLM is one input into a typed pipeline, not the whole pipeline.",
    quests: ["awf", "spydr", "ngon"],
  },
  {
    technique: "Home Turf",
    title: "Your machine, your rules",
    text: "Local-first, self-hosted, no telemetry. Nothing leaves your machine unless you send it on purpose.",
    quests: ["fridge", "chalkboard"],
  },
  {
    technique: "Hatsu · 発",
    title: "Whimsical, never childish",
    text: "Power systems become architecture. Post offices become pipelines. Cavemen become installers. Playful on the surface, carefully built underneath.",
    quests: ["night-catchers", "ngon", "claude-itect", "aal"],
  },
];

/** Public profiles shown in the footer "warp gates". */
export const LINKS = [
  { label: "GitHub", href: "https://github.com/jchildree" },
  { label: "itch.io", href: "https://jchildree.itch.io" },
  { label: "Buy me a coffee", href: "https://www.buymeacoffee.com/jchildree80" },
];
