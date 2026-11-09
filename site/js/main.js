/*
 * GreenSide Gaming — page logic.
 *
 * Reads the world data and renders each section. No framework, no build step:
 * every function below owns one section of the page.
 */
import { STAGES, REALMS, QUESTS, CODEX, LINKS } from "./data.js";

const MAX_STAGE = STAGES.length;
const SHIPPED_STAGE = MAX_STAGE;
const USABLE_STAGE = 4;
const THEME_KEY = "greenside-cycle";

const $ = (selector) => document.querySelector(selector);

/** Small helper to build an element with classes and text in one call. */
function el(tag, { className, text, attrs } = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  for (const [name, value] of Object.entries(attrs ?? {})) node.setAttribute(name, value);
  return node;
}

const realmById = (id) => REALMS.find((realm) => realm.id === id);
const questById = (id) => QUESTS.find((quest) => quest.id === id);
const stageName = (stage) => STAGES[stage - 1].name;

/* ── Player card ──────────────────────────────────────────── */

function renderPlayerCard() {
  const earnedXp = QUESTS.reduce((sum, quest) => sum + quest.stage, 0);
  const maxXp = QUESTS.length * MAX_STAGE;

  $("#player-level").textContent = QUESTS.length;
  $("#xp-text").textContent = `${earnedXp} / ${maxXp}`;
  requestAnimationFrame(() => {
    $("#xp-fill").style.width = `${(earnedXp / maxXp) * 100}%`;
  });

  const stats = [
    ["Quests", QUESTS.length],
    ["Wieldable", QUESTS.filter((q) => q.stage >= USABLE_STAGE).length],
    ["In the Forge", QUESTS.filter((q) => q.stage === 3).length],
    ["Realms", REALMS.length],
  ];
  const list = $("#player-stats");
  for (const [label, value] of stats) {
    const row = el("div");
    row.append(el("dt", { text: label }), el("dd", { text: value }));
    list.append(row);
  }
}

/* ── World map: realm tabs + quest cards ──────────────────── */

function buildQuestCard(quest) {
  const realm = realmById(quest.realm);
  const card = el("article", { className: "quest-card", attrs: { id: `quest-${quest.id}` } });
  card.style.setProperty("--accent", realm.hue);

  const top = el("div", { className: "quest-top" });
  top.append(
    el("span", { className: "quest-realm", text: `${realm.glyph} ${realm.name}` }),
    el("span", { className: "quest-stage", text: `Stage ${quest.stage} · ${stageName(quest.stage)}` }),
  );

  const meter = el("div", {
    className: "pips",
    attrs: { role: "img", "aria-label": `Progress ${quest.stage} of ${MAX_STAGE}` },
  });
  for (let pip = 1; pip <= MAX_STAGE; pip += 1) {
    meter.append(el("i", { className: pip <= quest.stage ? "on" : "" }));
  }

  const tech = el("ul", { className: "tech" });
  quest.tech.forEach((name) => tech.append(el("li", { text: name })));

  const actions = el("div", { className: "quest-actions" });
  if (quest.play) {
    actions.append(el("a", { className: "btn btn-small btn-primary", text: "▶ Play", attrs: { href: quest.play, target: "_blank", rel: "noopener" } }));
  }
  if (quest.repo) {
    actions.append(el("a", { className: "btn btn-small btn-ghost", text: "Source", attrs: { href: quest.repo, target: "_blank", rel: "noopener" } }));
  } else {
    actions.append(el("span", { className: "private-badge", text: "🔒 Private build" }));
  }

  card.append(
    top,
    el("h3", { text: quest.title }),
    el("p", { className: "quest-hook", text: `“${quest.hook}”` }),
    el("p", { className: "quest-body", text: quest.body }),
    meter,
    el("p", { className: "quest-status", text: quest.status }),
    tech,
    actions,
  );
  return card;
}

function renderQuests(realmId) {
  const grid = $("#quest-grid");
  const visible = realmId === "all" ? QUESTS : QUESTS.filter((quest) => quest.realm === realmId);
  grid.replaceChildren(...visible.map(buildQuestCard));

  const realm = realmById(realmId);
  $("#realm-blurb").textContent = realm ? realm.blurb : "Every quest, across every repository.";
}

function selectRealm(realmId) {
  document.querySelectorAll(".realm-tab").forEach((tab) => {
    tab.setAttribute("aria-selected", String(tab.dataset.realm === realmId));
  });
  renderQuests(realmId);
}

function renderRealmTabs() {
  const tabs = $("#realm-tabs");
  const options = [{ id: "all", name: "All Realms", glyph: "✧", hue: "var(--green)" }, ...REALMS];

  for (const realm of options) {
    const count = realm.id === "all" ? QUESTS.length : QUESTS.filter((q) => q.realm === realm.id).length;
    const tab = el("button", {
      className: "realm-tab",
      attrs: { type: "button", role: "tab", "data-realm": realm.id, "aria-selected": "false" },
    });
    tab.style.setProperty("--accent", realm.hue);
    tab.append(el("span", { text: `${realm.glyph} ${realm.name}` }), el("b", { text: count }));
    tab.addEventListener("click", () => selectRealm(realm.id));
    tabs.append(tab);
  }
  selectRealm("all");
}

/** Show every quest, then scroll to one card and make it flash. */
function warpToQuest(questId) {
  selectRealm("all");
  const card = document.getElementById(`quest-${questId}`);
  if (!card) return;
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  card.classList.remove("flash");
  void card.offsetWidth; // restart the CSS animation
  card.classList.add("flash");
}

/* ── Codex ────────────────────────────────────────────────── */

function renderCodex() {
  const grid = $("#codex-grid");
  CODEX.forEach((entry, index) => {
    const card = el("article", { className: "codex-card" });
    const chips = el("div", { className: "chips" });
    for (const questId of entry.quests) {
      const chip = el("button", { className: "chip", text: questById(questId).title, attrs: { type: "button" } });
      chip.addEventListener("click", () => warpToQuest(questId));
      chips.append(chip);
    }
    card.append(
      el("p", { className: "codex-index", text: String(index + 1).padStart(2, "0") }),
      el("p", { className: "codex-technique", text: entry.technique }),
      el("h3", { text: entry.title }),
      el("p", { text: entry.text }),
      chips,
    );
    grid.append(card);
  });
}

/* ── Training ground: AWF rune decoder ────────────────────── */

/** The golden fixture, split into runes. Meanings follow skill/skill.source.md. */
const RUNES = [
  { text: "Extract", kind: "Core Action", meaning: "One of the 16 closed core operators. It says what the agent does." },
  { text: "SystemLogs", kind: "Target", meaning: "The thing being acted on." },
  { text: "->", kind: "Modifier Arrow", meaning: "Starts the modifiers that shape how the action runs." },
  { text: "Depth:Critical", kind: "Modifier", meaning: "A Key:Value parameter. Go deep, but keep only what's critical." },
  { text: "|", kind: "Constraint Bar", meaning: "Separates the modifiers from the hard constraints." },
  { text: "P1", kind: "Precedence", meaning: "Priority 1. When constraints conflict, P1 > P2 > P3 > P4 > P5, and the higher one wins." },
  { text: "Lock:RawJSON", kind: "Constraint · Lock", meaning: "Treat the marked parameter as immutable, with zero variance during generation." },
  { text: "=>", kind: "Output Arrow", meaning: "Declares the output contract." },
  { text: "JSON", kind: "Output Format", meaning: "The agent must return exactly this format, with nothing else around it." },
];

function renderSpell() {
  const spell = $("#spell");
  const readout = $("#rune-readout");

  RUNES.forEach((rune, index) => {
    const button = el("button", { className: "rune", text: rune.text, attrs: { type: "button", "data-index": index } });
    button.addEventListener("click", () => {
      spell.querySelectorAll(".rune").forEach((other) => other.classList.toggle("active", other === button));
      readout.replaceChildren(
        el("p", { className: "rune-kind", text: rune.kind }),
        el("p", { className: "rune-text", text: rune.meaning }),
      );
    });
    spell.append(button);
  });
}

/* ── Trophy room: achievements derived from the data ──────── */

const TROPHIES = [
  { icon: "🏁", name: "Jam Survivor", desc: "Shipped a game jam entry that people can play", unlocked: () => QUESTS.some((q) => q.play) },
  { icon: "🗺️", name: "Cartographer", desc: "Has at least one quest in every realm", unlocked: () => REALMS.every((r) => QUESTS.some((q) => q.realm === r.id)) },
  { icon: "⚔️", name: "Wielder", desc: "Five or more tools usable today", unlocked: () => QUESTS.filter((q) => q.stage >= USABLE_STAGE).length >= 5 },
  { icon: "🔥", name: "Forge Keeper", desc: "Three or more builds on the anvil at once", unlocked: () => QUESTS.filter((q) => q.stage === 3).length >= 3 },
  { icon: "📜", name: "Lorekeeper", desc: "Codex has six techniques backed by real quests", unlocked: () => CODEX.length >= 6 && CODEX.every((c) => c.quests.every(questById)) },
  { icon: "🌱", name: "Tutorial Cleared", desc: "Every legend starts at level one", unlocked: () => questById("elevator")?.stage === SHIPPED_STAGE },
  { icon: "👑", name: "Full Clear", desc: "Every quest reaches Stage 5", unlocked: () => QUESTS.every((q) => q.stage === SHIPPED_STAGE) },
];

function renderTrophies() {
  const grid = $("#trophy-grid");
  for (const trophy of TROPHIES) {
    const isUnlocked = trophy.unlocked();
    const item = el("li", { className: `trophy ${isUnlocked ? "unlocked" : "locked"}` });
    item.append(
      el("span", { className: "trophy-icon", text: isUnlocked ? trophy.icon : "🔒", attrs: { "aria-hidden": "true" } }),
      el("strong", { text: trophy.name }),
      el("span", { text: isUnlocked ? trophy.desc : `Locked: ${trophy.desc}` }),
    );
    grid.append(item);
  }
}

/* ── Day / night cycle (theme) ────────────────────────────── */

function readSavedCycle() {
  try { return localStorage.getItem(THEME_KEY); } catch { return null; }
}

function saveCycle(cycle) {
  try { localStorage.setItem(THEME_KEY, cycle); } catch { /* storage blocked; theme still works */ }
}

function applyCycle(cycle) {
  document.documentElement.dataset.theme = cycle === "day" ? "light" : "dark";
  $("#cycle-label").textContent = cycle === "day" ? "Day" : "Night";
  $("#cycle-toggle").setAttribute("aria-pressed", String(cycle === "day"));
}

function setupDayNight() {
  const prefersDay = window.matchMedia("(prefers-color-scheme: light)").matches;
  let cycle = readSavedCycle() ?? (prefersDay ? "day" : "night");
  applyCycle(cycle);

  const toggle = () => {
    cycle = cycle === "day" ? "night" : "day";
    applyCycle(cycle);
    saveCycle(cycle);
  };
  $("#cycle-toggle").addEventListener("click", toggle);
  document.addEventListener("keydown", (event) => {
    const isTyping = event.target.closest("input, textarea, [contenteditable]");
    if (event.key.toLowerCase() === "e" && !isTyping && !event.metaKey && !event.ctrlKey) toggle();
  });
}

/* ── Secret: the classic code wakes up Ren ────────────────── */

const SECRET_CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3200);
}

function setupSecretCode() {
  let progress = 0;
  document.addEventListener("keydown", (event) => {
    const expected = SECRET_CODE[progress];
    progress = event.key === expected ? progress + 1 : event.key === SECRET_CODE[0] ? 1 : 0;
    if (progress === SECRET_CODE.length) {
      progress = 0;
      document.body.classList.toggle("ren-aura");
      showToast("練 Ren activated. Aura output +30%.");
    }
  });
}

/* ── Footer ───────────────────────────────────────────────── */

function renderFooter() {
  const gates = $("#warp-gates");
  for (const link of LINKS) {
    const item = el("li");
    item.append(el("a", { text: link.label, attrs: { href: link.href, target: "_blank", rel: "noopener" } }));
    gates.append(item);
  }
  $("#year").textContent = new Date().getFullYear();
}

/* ── Boot ─────────────────────────────────────────────────── */

setupDayNight();
renderPlayerCard();
renderRealmTabs();
renderCodex();
renderSpell();
renderTrophies();
renderFooter();
setupSecretCode();
