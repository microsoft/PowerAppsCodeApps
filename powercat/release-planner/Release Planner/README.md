# Microsoft Release Plans Explorer

A React + TypeScript + Vite app that fetches and displays feature data from the
[Microsoft Release Plans](https://releaseplans.microsoft.com) API with real-time
filtering, stat cards, and paginated feature cards.

## Features

- **Live streaming fetch** — pages load one at a time with a progress indicator;
  results appear as data arrives
- **Stat cards** — Total Records, Showing (filtered), GA count, Preview count
- **Filters** — keyword search, product dropdown, release wave dropdown, status
  (GA / Preview / Early Access / Planned)
- **Feature cards** — badge, product, investment area, wave, date, enabled-for,
  expandable business value + feature details
- **Pagination** — 10 results per page with Prev / Next
- **Reset Filters** button
- **Dark mode** support (respects `prefers-color-scheme`)

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## CORS and the dev proxy

The Microsoft Release Plans API does not include permissive CORS headers, so
direct browser requests are blocked.

**In development** the Vite dev server is pre-configured as a reverse proxy:

```
Browser → /api/releaseplans/ → Vite proxy → https://releaseplans.microsoft.com/en-US/allreleaseplans/
```

This is set up in `vite.config.ts` and requires **no extra steps** when using
`npm run dev`.

**In production** you need to provide a server-side proxy yourself. Options:

| Approach | Notes |
|---|---|
| Nginx `proxy_pass` | Add a `/api/releaseplans` location block that proxies to the MS host |
| Cloudflare Worker / Edge Function | Rewrite the URL and forward the request |
| Express/Node middleware | Use `http-proxy-middleware` |
| Azure API Management | Route and forward with a policy |

Change the `API_BASE` constant in `src/ReleasePlansExplorer.tsx` to point at
your production proxy path if it differs from `/api/releaseplans`.

## API reference

| Field | Source |
|---|---|
| Base URL | `https://releaseplans.microsoft.com/en-US/allreleaseplans/` |
| Pagination | `?page=N` — keep fetching while `morerecords: true` |
| Total pages | ~5 pages for ~1 500 records |

### Status classification logic

| Status | Condition |
|---|---|
| **GA** | `GA date` or `GA Release Wave` is non-empty |
| **Preview** | `Public preview date` or `Public Preview Release Wave` is non-empty (and not GA) |
| **Early Access** | `Early access date` is non-empty (and not GA or Preview) |
| **Planned** | None of the above |

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://typescriptlang.org)
- [Vite 7](https://vite.dev)
- Plain CSS (no external UI library)
