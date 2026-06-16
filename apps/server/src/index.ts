import { getRequestListener } from '@hono/node-server';
import { createServer } from 'node:http';

import {
  ActivePublisherUpdateSchema,
  MediaTokenRequestSchema,
  PublisherKickSchema,
  SOCKET_EVENTS,
  SlideCommandSchema,
  SocketRoomJoinSchema,
  SocketRoomLeaveSchema,
  StreamLayoutUpdateSchema,
  TandemError,
} from '@tandem/shared';
import { Server } from 'socket.io';

import { createApp } from './app.js';
import { loadEnv } from './env.js';
import { isAllowedCorsOrigin } from './env.js';
import { LiveKitService } from './features/media/livekit-service.js';
import { MemoryRoomStore } from './features/rooms/memory-room-store.js';
import {
  broadcastRoomUpdates,
  kickPublisherWithSync,
} from './features/rooms/room-realtime.js';
import { RoomService } from './features/rooms/room-service.js';
import { logger } from './lib/logger.js';

const env = loadEnv();
const store = new MemoryRoomStore();
const roomService = new RoomService(store, env);
const liveKitService = new LiveKitService(env);

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedCorsOrigin(env, origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.on(SOCKET_EVENTS.ROOM_JOIN, async (raw) => {
    const parsed = SocketRoomJoinSchema.safeParse(raw);
    if (!parsed.success) {
      socket.emit(SOCKET_EVENTS.ERROR, { code: 'INVALID_PAYLOAD', message: 'Invalid join payload' });
      return;
    }

    const { roomCode } = parsed.data;

    try {
      const room = await roomService.getRoom(roomCode);
      socket.data.participantId = parsed.data.participantId;
      socket.data.roomCode = roomCode;
      socket.join(roomCode);

      const participants = await roomService.getParticipants(roomCode);
      io.to(roomCode).emit(SOCKET_EVENTS.ROOM_STATE, { room, participants });

      const layout = await roomService.getStreamLayout(roomCode);
      socket.emit(SOCKET_EVENTS.STREAM_LAYOUT_STATE, layout);

      const publisherState = await roomService.getActivePublisherState(roomCode);
      io.to(roomCode).emit(SOCKET_EVENTS.ACTIVE_PUBLISHER_STATE, publisherState);
    } catch (error) {
      emitSocketError(socket, error);
    }
  });

  socket.on(SOCKET_EVENTS.STREAM_LAYOUT_UPDATE, async (raw) => {
    const parsed = StreamLayoutUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      socket.emit(SOCKET_EVENTS.ERROR, {
        code: 'INVALID_PAYLOAD',
        message: 'Invalid stream layout payload',
      });
      return;
    }

    try {
      const { layout, broadcast } = await roomService.updateStreamLayout(
        parsed.data.roomCode,
        parsed.data.participantId,
        parsed.data.visibleSlots,
        parsed.data.auxLabels,
      );
      if (broadcast) {
        io.to(parsed.data.roomCode).emit(SOCKET_EVENTS.STREAM_LAYOUT_STATE, layout);
      }
    } catch (error) {
      emitSocketError(socket, error);
    }
  });

  socket.on(SOCKET_EVENTS.ACTIVE_PUBLISHER_UPDATE, async (raw) => {
    const parsed = ActivePublisherUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      socket.emit(SOCKET_EVENTS.ERROR, {
        code: 'INVALID_PAYLOAD',
        message: 'Invalid active publisher payload',
      });
      return;
    }

    try {
      const { state, layout } = await roomService.setActivePublisher(
        parsed.data.roomCode,
        parsed.data.participantId,
        parsed.data.activePublisherId,
      );
      io.to(parsed.data.roomCode).emit(SOCKET_EVENTS.ACTIVE_PUBLISHER_STATE, state);
      io.to(parsed.data.roomCode).emit(SOCKET_EVENTS.STREAM_LAYOUT_STATE, layout);
    } catch (error) {
      emitSocketError(socket, error);
    }
  });

  socket.on(SOCKET_EVENTS.ROOM_LEAVE, async (raw) => {
    const parsed = SocketRoomLeaveSchema.safeParse(raw);
    if (!parsed.success) {
      return;
    }

    const { roomCode, participantId } = parsed.data;
    socket.leave(roomCode);
    const room = await roomService.leaveRoom(roomCode, participantId);

    await broadcastRoomUpdates(io, roomService, roomCode, room);
  });

  socket.on(SOCKET_EVENTS.PUBLISHER_KICK, async (raw) => {
    const parsed = PublisherKickSchema.safeParse(raw);
    if (!parsed.success) {
      socket.emit(SOCKET_EVENTS.ERROR, {
        code: 'INVALID_PAYLOAD',
        message: 'Invalid publisher kick payload',
      });
      return;
    }

    const { roomCode, participantId, targetPublisherId } = parsed.data;

    try {
      await kickPublisherWithSync(io, roomService, roomCode, participantId, targetPublisherId);
    } catch (error) {
      emitSocketError(socket, error);
    }
  });

  socket.on(SOCKET_EVENTS.SLIDE_FORWARD, async (raw) => {
    await handleSlideCommand(io, socket, roomService, raw, 'forward');
  });

  socket.on(SOCKET_EVENTS.SLIDE_BACK, async (raw) => {
    await handleSlideCommand(io, socket, roomService, raw, 'back');
  });

  socket.on(SOCKET_EVENTS.MEDIA_TOKEN, async (raw, callback) => {
    const parsed = MediaTokenRequestSchema.safeParse(raw);

    if (!parsed.success || typeof callback !== 'function') {
      return;
    }

    try {
      const token = await liveKitService.createToken(
        parsed.data.roomCode,
        parsed.data.participantId,
        parsed.data.role,
      );
      callback({
        token,
        url: liveKitService.getClientUrl(),
      });
    } catch (error) {
      emitSocketError(socket, error);
    }
  });
});

const app = createApp(env, roomService, liveKitService, io);
const handle = getRequestListener(app.fetch);

httpServer.on('request', (request, response) => {
  const url = request.url ?? '';

  if (url.startsWith('/socket.io')) {
    return;
  }

  return handle(request, response);
});

httpServer.listen(env.PORT, env.HOST, () => {
  logger.info({ port: env.PORT, host: env.HOST }, 'Tandem server listening');
});

async function handleSlideCommand(
  io: Server,
  socket: import('socket.io').Socket,
  roomService: RoomService,
  raw: unknown,
  direction: 'forward' | 'back',
): Promise<void> {
  const parsed = SlideCommandSchema.safeParse(raw);
  if (!parsed.success) {
    socket.emit(SOCKET_EVENTS.ERROR, { code: 'INVALID_PAYLOAD', message: 'Invalid slide command' });
    return;
  }

  try {
    const index = await roomService.advanceSlide(parsed.data.roomCode, direction, parsed.data.participantId);
    const slideEvent =
      direction === 'forward' ? SOCKET_EVENTS.SLIDE_FORWARD : SOCKET_EVENTS.SLIDE_BACK;

    // Relay to the desktop publisher; the web client only sends these commands.
    socket.to(parsed.data.roomCode).emit(slideEvent);

    io.to(parsed.data.roomCode).emit(SOCKET_EVENTS.SLIDE_STATE, {
      roomCode: parsed.data.roomCode,
      index,
      updatedBy: parsed.data.participantId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    emitSocketError(socket, error);
  }
}

function emitSocketError(socket: import('socket.io').Socket, error: unknown): void {
  if (error instanceof TandemError) {
    socket.emit(SOCKET_EVENTS.ERROR, { code: error.code, message: error.message });
    return;
  }

  logger.error({ error }, 'Socket handler error');
  socket.emit(SOCKET_EVENTS.ERROR, { code: 'INTERNAL_ERROR', message: 'Unexpected error' });
}
