# Agent Desk

Free tools and Power BI reports for contact-centre agents, with eight extra tools for travel and lodging teams (guest and B2B work).
A static site in plain HTML, CSS and JavaScript. No framework, no runtime dependencies, nothing you type leaves the browser.

- **Public pages** (`/`, `/reports/`, `/tools/`, `/guides/`, `/glossary/`, legal pages): written content plus each tool and report, indexable, the only place ads may ever appear.
- **Workspace** (`/portal/`): the original sidebar-and-report layout, dark glass by default, no ads, `noindex`.
- **15 tools**, **3 Power BI reports**, **5 guides**, **64 glossary terms**.

## Quick start

```bash
npm install          # only needed for tests and the browser check
npm run build        # writes dist/
npm run check        # build + preflight + link check + all tests
npm run browser      # real-Chromium check (needs the optional dev dependencies)
```

Deploy: connect the repo to Netlify. `netlify.toml` already sets the build command (`node build.mjs && node scripts/preflight.mjs dist`) and publish folder (`dist`). The deploy fails if any AdSense-readiness rule is broken. See [docs/DEPLOY.md](docs/DEPLOY.md).

## Where things live

| Path | What it is |
|------|------------|
| `site.config.json` | Name, URL, contact, author, AdSense stage and slot, the three report URLs and their optional facts. Schema: `site.config.schema.json` |
| `src/content/**/*.md` | Every page's text, with front matter. Edit these to change the site |
| `src/assets/js/tools/*.js` | The 15 tools, one module each. `src/assets/js/meta.js` lists them |
| `src/assets/js/lib/*.js` | The tested logic behind the tools: time zones, money, cancellation, commission, groups, CSV, names, card-number check |
| `src/tokens.mjs` | The design tokens, light and dark. `tokens.css` is generated from it |
| `build.mjs`, `scripts/` | Generator, preflight gate, link checker, contrast gate, browser check |
| `tests/` | 45 automated tests |
| `docs/` | Architecture and deployment notes, and screenshots from the browser check |

## Before you publish

1. Set `author.name` in `site.config.json` (preflight warns until you do).
2. Confirm the public Power BI embeds are cleared for public release. See `docs/DEPLOY.md`, step 1.
3. Fill in `audience`, `cadence` and `refreshed` for each report if you want the facts panel to show them.

Font files are SIL Open Font License (see `src/assets/fonts/LICENSE-*.txt`).
