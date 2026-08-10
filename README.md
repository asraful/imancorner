# Iman Corner

Trilingual (English / العربية / Suomi) community events site, live at
**[imancorner.org](https://imancorner.org)**.

Fully static Astro site, hosted free on GitHub Pages, with browser-based content
editing through Decap CMS at [imancorner.org/admin](https://imancorner.org/admin/).
Full setup details and troubleshooting live in [docs/SETUP.md](docs/SETUP.md).

## Architecture

```mermaid
flowchart TB
    subgraph visitors["Visitors"]
        V["Browser<br/>en / ar / fi"]
    end

    subgraph dns["DNS — Namecheap"]
        D["imancorner.org → 4 × GitHub Pages A records<br/>www → asraful.github.io (301 to apex)"]
    end

    subgraph gh["GitHub"]
        P["GitHub Pages CDN<br/>static HTML + HTTPS cert"]
        R["Repo asraful/imancorner<br/>content: src/content/&lt;collection&gt;/&lt;lang&gt;/&lt;slug&gt;.md"]
        A["GitHub Actions<br/>Astro build → deploy (~2 min)"]
    end

    subgraph editing["Content editing"]
        E["Editor browser<br/>/admin (Decap CMS)"]
        W["Cloudflare Worker<br/>sveltia-cms-auth<br/>(GitHub OAuth gateway)"]
        O["GitHub OAuth App<br/>Iman Corner CMS"]
    end

    V -->|"1 · resolve"| D
    D -->|"2 · route"| P
    E -->|"login"| W
    W <-->|"code ⇄ token"| O
    E -->|"commit via GitHub API<br/>(needs repo write access)"| R
    R -->|"push to main triggers"| A
    A -->|"publish dist/"| P
```

**Key properties**

- **No servers to run.** The site is prebuilt HTML on GitHub Pages; the only moving part
  is a ~50-line Cloudflare Worker that performs the CMS login handshake.
- **Git is the database.** Every event and page is a markdown file; every edit — CMS or
  manual — is a commit with an author, so history and rollback come free.
- **Access control = repo permissions.** Anyone with write access to this repo can log
  in to `/admin` with their own GitHub account; nobody else can publish.

## Content & i18n model

One entry = one event or page, translated in place. The CMS edits all three languages in
a single editor (Decap i18n, `multiple_folders`); each language saves to its own folder
and translations share a filename, which is also the URL slug:

```
src/content/events/en/eid-gathering-2026.md   →  /en/events/eid-gathering-2026/
src/content/events/ar/eid-gathering-2026.md   →  /ar/events/eid-gathering-2026/
src/content/events/fi/eid-gathering-2026.md   →  /fi/events/eid-gathering-2026/
```

Language and slug are derived from the path — not frontmatter. Standalone **Pages**
(About, Contact, …) work the same way at `/<lang>/<slug>/`, with optional
`showInNav`/`navOrder` to appear in the header menu. Drafts (`isDraft`) never publish.

## Ops — how a change goes live

```mermaid
sequenceDiagram
    actor Editor
    participant CMS as Decap CMS (/admin)
    participant Auth as Cloudflare Worker<br/>sveltia-cms-auth
    participant GH as GitHub<br/>repo main
    participant CI as GitHub Actions
    participant Pages as GitHub Pages

    Editor->>CMS: open imancorner.org/admin
    CMS->>Auth: Login with GitHub
    Auth->>GH: OAuth code → access token
    Auth-->>CMS: token (postMessage)
    Editor->>CMS: write event in EN / AR / FI, Publish
    CMS->>GH: commit markdown (author = editor)
    GH->>CI: push triggers deploy.yml
    CI->>CI: withastro/action@v3 build (Node 22)
    CI->>Pages: actions/deploy-pages@v4
    Pages-->>Editor: live at imancorner.org (~2 min)
```

The same pipeline runs for manual edits: change any file on `main` (locally or on
github.com) and the site redeploys automatically.

## Infrastructure reference

| Piece | Where | Notes |
|---|---|---|
| Hosting | GitHub Pages (workflow deploys) | Custom domain `imancorner.org`, Enforce HTTPS on |
| Build | `.github/workflows/deploy.yml` | Astro 7 needs `node-version: 22` |
| DNS | Namecheap (BasicDNS) | Apex A records + `www` CNAME, see diagram |
| CMS | Decap CMS 3 (`public/admin/`) | Single trilingual Events + Pages collections |
| CMS auth | `sveltia-cms-auth.imancorner.workers.dev` | Cloudflare Worker, account `imancorner.org@gmail.com` |
| OAuth app | "Iman Corner CMS" (GitHub) | Callback → worker `/callback` |
| Sister site | [tamperequrancompetition.imancorner.org](https://tamperequrancompetition.imancorner.org) | Separate repo [asraful/tamperequrancompetition](https://github.com/asraful/tamperequrancompetition) |

## Local development

```bash
npm install
npm run dev      # dev server at localhost:4321
npm run build    # production build to dist/
npm run check    # type-check
```

Built with [Astro 7](https://astro.build) · [Alpine.js](https://alpinejs.dev) ·
[Decap CMS](https://decapcms.org)
