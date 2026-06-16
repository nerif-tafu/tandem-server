import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Server } from 'socket.io';

import {
  CreateRoomRequestSchema,
  JoinRoomRequestSchema,
  KickPublisherRequestSchema,
  MediaTokenRequestSchema,
  TandemError,
} from '@tandem/shared';

import type { Env } from './env.js';
import { resolveCorsOrigin } from './env.js';
import { LiveKitService } from './features/media/livekit-service.js';
import { kickPublisherWithSync } from './features/rooms/room-realtime.js';
import { RoomService } from './features/rooms/room-service.js';
import { fetchLatestDesktopRelease } from './features/downloads/desktop-releases.js';
import { logger } from './lib/logger.js';

export function createApp(
  env: Env,
  roomService: RoomService,
  liveKitService: LiveKitService,
  io: Server,
): Hono {
  const app = new Hono();

  app.use('*', honoLogger());
  app.use(
    '*',
    cors({
      origin: (origin) => resolveCorsOrigin(env, origin),
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      allowHeaders: ['Content-Type'],
    }),
  );

  app.get('/health', (context) => context.json({ status: 'ok' }));

  app.get('/api/downloads/desktop', async (context) => {
    try {
      const release = await fetchLatestDesktopRelease(env.DESKTOP_RELEASES_REPO);
      if (!release) {
        return context.json({ error: { code: 'NOT_FOUND', message: 'No desktop release found' } }, 404);
      }

      return context.json({ release });
    } catch (error) {
      logger.error({ error }, 'Failed to fetch desktop release');
      return context.json(
        { error: { code: 'UPSTREAM_ERROR', message: 'Could not load desktop downloads' } },
        502,
      );
    }
  });

  app.post('/api/rooms', async (context) => {
    try {
      const body = CreateRoomRequestSchema.parse(await context.req.json().catch(() => ({})));
      const room = await roomService.createRoom(body);
      return context.json({ room }, 201);
    } catch (error) {
      return toErrorResponse(error);
    }
  });

  app.get('/api/rooms/:code', async (context) => {
    try {
      const room = await roomService.getRoom(context.req.param('code'));
      return context.json({ room });
    } catch (error) {
      return toErrorResponse(error);
    }
  });

  app.post('/api/rooms/:code/join', async (context) => {
    try {
      const body = JoinRoomRequestSchema.parse(await context.req.json());
      const result = await roomService.joinRoom(context.req.param('code'), body);
      return context.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });

  app.post('/api/rooms/:code/media-token', async (context) => {
    try {
      const body = MediaTokenRequestSchema.parse(await context.req.json());
      const token = await liveKitService.createToken(body.roomCode, body.participantId, body.role);
      const clientHostname = resolveClientHostname(context);
      return context.json({
        token,
        url: liveKitService.getClientUrl(clientHostname),
      });
    } catch (error) {
      return toErrorResponse(error);
    }
  });

  app.post('/api/rooms/:code/kick', async (context) => {
    try {
      const body = KickPublisherRequestSchema.parse(await context.req.json());
      const roomCode = context.req.param('code');
      const room = await kickPublisherWithSync(
        io,
        roomService,
        roomCode,
        body.participantId,
        body.targetPublisherId,
      );

      const participants = room ? await roomService.getParticipants(roomCode) : [];
      const activePublisherState = await roomService.getActivePublisherState(roomCode);

      return context.json({ room, participants, activePublisherState });
    } catch (error) {
      return toErrorResponse(error);
    }
  });

  if (env.STATIC_WEB_DIR && existsSync(env.STATIC_WEB_DIR)) {
    app.use('/*', serveStatic({ root: env.STATIC_WEB_DIR }));
    app.get('*', serveStatic({ path: join(env.STATIC_WEB_DIR, 'index.html') }));
  }

  return app;
}

function resolveClientHostname(context: { req: { header: (name: string) => string | undefined } }): string | undefined {
  const origin = context.req.header('origin');
  if (origin) {
    try {
      return new URL(origin).hostname;
    } catch {
      // ignore malformed origin
    }
  }

  const referer = context.req.header('referer');
  if (referer) {
    try {
      return new URL(referer).hostname;
    } catch {
      // ignore malformed referer
    }
  }

  return undefined;
}

function toErrorResponse(error: unknown): Response {
  if (error instanceof TandemError) {
    const status =
      error.code === 'ROOM_NOT_FOUND' || error.code === 'NOT_FOUND'
        ? 404
        : error.code === 'INVALID_ROOM_PASSWORD'
          ? 401
          : error.code === 'ROOM_PASSWORD_REQUIRED'
            ? 401
            : error.code === 'FORBIDDEN'
              ? 403
              : error.code === 'ROOM_CODE_TAKEN'
                ? 409
                : 400;

    return new Response(JSON.stringify({ error: { code: error.code, message: error.message } }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  logger.error({ error }, 'Unhandled API error');

  return new Response(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected error' } }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}
