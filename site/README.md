# greensidegaming.org

The GreenSide Gaming guild hall: one static site that collects every project
(games, engines, compilers, agents, life tools) into a single world map.

No framework and no build step. Plain HTML, CSS, and ES modules.

```
site/
  index.html        page skeleton (sections + mount points)
  css/styles.css    tokens (night/day), layout, components
  js/data.js        ALL content: realms, quests, codex, links  <- edit this
  js/main.js        renders each section from data.js
  assets/           favicon
  CNAME             custom domain for GitHub Pages
```

## Run locally

ES modules need a server (opening the file directly won't work):

```sh
python3 -m http.server -d site 8080   # then open http://localhost:8080
```

## Add or update a project

Edit `js/data.js`:

- Add an object to `QUESTS` (`realm`, `title`, `hook`, `body`, `tech`, `stage` 1-5, `status`).
- Set `repo` only for public repositories, so visitors never hit a 404.
- The player level, XP bar, and trophies are all computed from the quest log.

## Deploy

`.github/workflows/pages.yml` publishes `site/` to GitHub Pages on every push to
`main` that touches it. One-time setup:

1. Repo **Settings → Pages → Source: GitHub Actions**.
2. At your DNS registrar for `greensidegaming.org`, add:
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www` → `jchildree.github.io`
3. Back in **Settings → Pages**, confirm the custom domain and tick **Enforce HTTPS**.

Easter eggs: press `E` to switch between day and night. There may also be a code.
