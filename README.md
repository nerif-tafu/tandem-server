# Tandem Server

Web viewer, REST API, Socket.IO realtime, and LiveKit integration for [Tandem](https://github.com/nerif-tafu/tandem-desktop).

## Stack

- **API** — Hono (`apps/server`)
- **Web** — React + Vite (`apps/web`)
- **Shared protocol** — `@tandem/shared` (`packages/shared`)

## Development

```bash
pnpm install
pnpm dev:server   # API on :3841
pnpm dev:web      # Web on :5173 (proxies /api to server)
```

Start Redis and LiveKit via Docker:

```bash
cp docker/.env.example docker/.env
docker compose -f docker/docker-compose.yml up
```

## Production

Build the web app and server, then run the server with `STATIC_WEB_DIR` pointing at the web build output. A multi-stage Docker image is published from this repo (see `.github/workflows/docker-server.yml`).

## Desktop downloads

The web app exposes `/download`, which lists the latest release assets from [tandem-desktop](https://github.com/nerif-tafu/tandem-desktop). Configure the source repo with `DESKTOP_RELEASES_REPO` (default: `nerif-tafu/tandem-desktop`).

## Related repo

- [tandem-desktop](https://github.com/nerif-tafu/tandem-desktop) — Tauri desktop publisher
