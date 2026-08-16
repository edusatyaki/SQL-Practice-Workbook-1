# SQL Practice Workbook — Live Presenter

A PowerPoint-style presenter for the PostgreSQL SQL Practice Workbook (36 problems).
For each problem you **click once** and the SQL answer is *typed out live* (like coding
on stage), then **click Run** and the exact query output appears — as if executed in psql.

## How to run

Just open the file — no build step, no server needed:

```bash
open sql-presenter/index.html
```

(Or serve it: `python3 -m http.server 8099 --directory sql-presenter` → http://localhost:8099)

## Deploy to GitHub Pages

The presenter is a static site (`index.html` + `data.js`, all relative paths) at the repo root.
A workflow at `.github/workflows/deploy-pages.yml` publishes it on every push to `main`.

One-time setup:

1. On GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. Push to `main` (or run the workflow manually from the **Actions** tab).

The site goes live at **https://edusatyaki.github.io/SQL-Practice-Workbook-1/**.
(Public repos deploy Pages on the free plan; private repos need a paid plan.)

To run locally instead, just `open index.html`.

## Presenting

| Key | Action |
|-----|--------|
| `Space` / `→` / click | Advance: write query → run → next problem (skips typing if mid-type) |
| `←` | Step back / previous slide |
| `H` | Reveal / hide hints |
| `R` | Reset the current slide |
| `☰` / `O` | Contents — jump to any of the 36 problems |
| `Home` / `End` | First / last slide |

## pgAdmin 4 look & feel

The presenter is skinned as the pgAdmin 4 Query Tool:

- **Object Explorer tree** — click the top-left rail icon to expand the server → database → schema → tables tree.
- **Data grid output** — SELECT-style results render as a real bordered pgAdmin grid (row numbers, right-aligned numbers, `[null]` cells); DDL/DML land in the **Messages** tab as `CREATE Query returned successfully in N msec.`; errors show in red.
- **Light / dark theme** — click the sun icon at the bottom-left of the rail to toggle.

## The three steps per problem

1. **Read** — question + "Given" state (before).
2. **Query written** — click the editor; the answer types itself with syntax highlighting.
3. **Executed** — click **Run**; the output panel shows the exact result.

## Content

Covers Units 0–9: CREATE DATABASE/TABLE, the full ALTER set, TRUNCATE/DROP,
INSERT (incl. upsert & RETURNING), SELECT, UPDATE, DELETE, transactions (TCL),
and GRANT/REVOKE (DCL). Source: *Lecture 2 — SQL Practice Workbook, PostgreSQL*.

Files: `index.html` (app + styles + logic), `data.js` (all 36 problems).
