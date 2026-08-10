# imancorner.org — Setup Documentation

How this site is built, hosted, and maintained — from the first commit to the working CMS.
Written 2026-08-10.

## Overview

**imancorner.org** is a trilingual (English / العربية / Suomi) events site for the Iman Corner
community, built as a fully static site and hosted for free on GitHub Pages. Content is managed
either by editing markdown files directly or through a browser-based CMS at
[imancorner.org/admin](https://imancorner.org/admin/).

The project spans **two intentionally separate repositories**:

| Repo | Site | Purpose |
|---|---|---|
| [asraful/imancorner](https://github.com/asraful/imancorner) | https://imancorner.org | Main trilingual events site (this repo) |
| [asraful/tamperequrancompetition](https://github.com/asraful/tamperequrancompetition) | https://tamperequrancompetition.imancorner.org | Zero-JS single-page microsite for the Tampere Quran competition |

## Tech stack

- **[Astro 7](https://astro.build)** — static site generator (`output: 'static'`), requires Node >= 22.12
- **[Alpine.js 3](https://alpinejs.dev)** — the only client-side JS, via `@astrojs/alpinejs`
- **[Decap CMS](https://decapcms.org)** — browser-based content editor served at `/admin`
- **TypeScript** — content schemas (`src/content.config.ts`) and i18n helpers

### Repository layout

```
├── .github/workflows/deploy.yml   # Build & deploy pipeline
├── astro.config.mjs               # site: https://imancorner.org, Alpine integration
├── public/
│   ├── CNAME                      # Custom domain marker
│   ├── admin/                     # Decap CMS (index.html + config.yml)
│   └── images/uploads/            # CMS media uploads land here
└── src/
    ├── components/                # EventCard, LanguageSwitcher
    ├── content/events/{en,ar,fi}/ # One markdown file per event per language
    ├── i18n/                      # UI translations
    ├── layouts/BaseLayout.astro
    ├── pages/                     # / (redirect to /en/), /[lang]/, /[lang]/events/[slug]
    ├── scripts/alpine.ts
    └── styles/global.css
```

### Content model

**Events** live in `src/content/events/<lang>/<translationKey>.md`. Translations of the same
event share the **same `translationKey`** (which is also the filename and the URL slug) — that's
how the language switcher links them. Frontmatter fields: `title`, `eventDate`, `location`,
`videoUrl` (any YouTube link — normalized to the embed form at build time), `tags`, `isDraft`
(drafts are never published), `language`, `translationKey`.

**Pages** (About, Contact, …) live in `src/content/pages/<lang>/<translationKey>.md` and are
published at `/<lang>/<translationKey>/` by `src/pages/[lang]/[slug].astro`. Same translation-key
model as events. Extra frontmatter: `description` (SEO, optional), `showInNav` (adds the page to
the header menu), `navOrder` (menu position, lower first). The translation key `events` is
reserved. A draft example lives at `src/content/pages/en/example-page.md`.

## Hosting & deployment

### GitHub Pages via Actions workflow

Every push to `main` triggers `.github/workflows/deploy.yml`:

1. `withastro/action@v3` builds the site (**`node-version: 22` is required** — Astro 7 needs
   Node >= 22.12 and the action's default is older)
2. `actions/deploy-pages@v4` publishes the build artifact to GitHub Pages

Deploys take ~2 minutes end to end. Pages is configured with `build_type=workflow`
(deploy-from-Actions, not deploy-from-branch).

### Setup gotchas we hit (and their fixes)

- **Enabling Pages**: the repo Settings UI didn't stick and `actions/configure-pages` failed
  (needs admin perms). What worked:
  `gh api repos/asraful/imancorner/pages -X POST -f build_type=workflow`
- **Custom domain attach**: with workflow deploys, the `public/CNAME` file does **not** attach
  the domain by itself. It must be set in the Pages settings — either the Settings → Pages UI
  or `gh api repos/asraful/imancorner/pages -X PUT -f cname=imancorner.org`
- **Domain detached itself** (2026-08-10): the API-attached domain silently dropped, making
  imancorner.org return 404 while `asraful.github.io/imancorner/` still worked. Re-attached via
  the Settings UI. **Prevention**: verify the domain account-wide at
  [github.com/settings/pages](https://github.com/settings/pages) (TXT record at the DNS host)
  so it can't detach or be taken over.

### DNS (Namecheap, BasicDNS)

| Host | Type | Value |
|---|---|---|
| `@` | A ×4 | `185.199.108.153`, `.109.153`, `.110.153`, `.111.153` (GitHub Pages) |
| `www` | CNAME | `asraful.github.io` |
| `tamperequrancompetition` | CNAME | `asraful.github.io` |

`www.imancorner.org` 301-redirects to the apex. HTTPS cert is provisioned automatically by
GitHub once the domain is attached; "Enforce HTTPS" should stay enabled in Pages settings.

## Content management (Decap CMS)

### Architecture

The CMS is two static files (`public/admin/index.html` + `config.yml`) — the editor runs
entirely in the browser and commits directly to `main` via the GitHub API. Publishing an entry
creates a commit, which triggers the deploy workflow, so changes are live ~2 minutes after
hitting Publish.

Logging in with GitHub requires an **OAuth gateway** — a tiny server that exchanges the OAuth
code for a token, because the client secret can't live in a static page. GitHub Pages can't run
server code, so the gateway is a **Cloudflare Worker**:

```
Browser (/admin) ──login──▶ Worker (sveltia-cms-auth) ──▶ GitHub OAuth ──▶ token back to CMS
```

### The pieces

| Piece | Value |
|---|---|
| Worker | https://sveltia-cms-auth.imancorner.workers.dev ([sveltia/sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)) |
| Cloudflare account | imancorner.org@gmail.com, subdomain `imancorner.workers.dev` |
| GitHub OAuth App | "Iman Corner CMS" ([github.com/settings/developers](https://github.com/settings/developers)), callback `https://sveltia-cms-auth.imancorner.workers.dev/callback` |
| Worker env vars | `ALLOWED_DOMAINS=imancorner.org`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (secret) |
| CMS hook-up | `backend.base_url` in `public/admin/config.yml` points at the worker |

To rotate the OAuth client secret: generate a new one on the OAuth App page, then
`npx wrangler secret put GITHUB_CLIENT_SECRET --name sveltia-cms-auth`.

To redeploy the worker: clone `sveltia/sveltia-cms-auth`, add the `[vars]` to `wrangler.toml`,
`npx wrangler deploy` (requires `wrangler login`).

### Posting an event

1. Go to [imancorner.org/admin](https://imancorner.org/admin/) → **Login with GitHub**
2. Pick **Events (English)** → **New English event**
3. Fill in title, date, location, optional video embed URL, and a **Translation key**
   (e.g. `eid-gathering-2026` — becomes the URL; lowercase, hyphens, no spaces)
4. **Publish** — live in ~2 minutes
5. Repeat in **Events (العربية)** / **Events (Suomi)** with the **same translation key**
6. Use the **Draft** toggle to keep an entry off the live site

### Creating a standalone page

Same flow via **Pages (English / العربية / Suomi)** in the admin: title, optional description,
a **Translation key** (becomes the URL, e.g. `about` → `/en/about/`), and the body in markdown.
Turn on **Show in menu** to add it to the header navigation; **Menu order** controls its
position. Create the same translation key in each language to link them.

Alternative without the CMS: edit the markdown files under `src/content/` directly on
github.com — same result.

## Local development

```bash
npm install
npm run dev      # dev server at localhost:4321
npm run build    # production build to dist/
npm run check    # type-check
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| imancorner.org 404s but `asraful.github.io/imancorner/` works | Custom domain detached from Pages | Re-attach in Settings → Pages; verify domain account-wide to prevent recurrence |
| Browser shows TLS/cert error for imancorner.org | GitHub serving `*.github.io` cert — domain not attached or cert still provisioning | Same as above; cert issues within minutes of attach |
| CMS "Login with GitHub" fails | Worker misconfigured or secret missing | `curl "https://sveltia-cms-auth.imancorner.workers.dev/auth?provider=github&site_id=imancorner.org"` should 302 to github.com; note the worker only answers GET — `curl -I` (HEAD) returns 404 by design |
| Deploy workflow fails on build | Node version | The workflow must pass `node-version: 22` to `withastro/action` |
| Published event doesn't appear | `isDraft: true`, or deploy still running | Check the Actions tab; flip the Draft toggle |

## Known open items

- Real competition facts in the microsite repo's `src/data/competition.ts` (placeholders in brackets)
- Real `videoUrl` for the sample event
- Decap editorial workflow (draft/review queue) is not enabled — publishes commit straight to `main`
