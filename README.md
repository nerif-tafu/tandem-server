# Tandem Server

The web viewer, API, and realtime layer for [Tandem](https://github.com/nerif-tafu/tandem-desktop). Handles rooms, slide commands, and video streaming via LiveKit.

## What's in this repo

- **API** (`apps/server`): Hono HTTP server and Socket.IO
- **Web** (`apps/web`): React viewer and landing site
- **Shared** (`packages/shared`): Types and protocol schemas used by both repos

## Development

```bash
pnpm install
pnpm dev:server   # API on :3841
pnpm dev:web      # Web on :5173 (proxies /api to the server)
```

You also need Redis and LiveKit running locally. The easiest way is Docker:

```bash
cp docker/.env.example docker/.env
docker compose -f docker/docker-compose.yml up
```

## Production

Build the web app and server, then point `STATIC_WEB_DIR` at the web build output. This repo publishes a multi-stage Docker image; see `.github/workflows/docker-server.yml`.

## Desktop downloads

The site serves a `/download` page that pulls the latest release from [tandem-desktop](https://github.com/nerif-tafu/tandem-desktop). Set `DESKTOP_RELEASES_REPO` if you host your own desktop builds (default: `nerif-tafu/tandem-desktop`).

## Related repo

- [tandem-desktop](https://github.com/nerif-tafu/tandem-desktop): desktop publisher app
