import { SOCKET_EVENTS, type Room } from '@tandem/shared';
import type { Server } from 'socket.io';

import type { RoomService } from './room-service.js';

export async function notifyPublisherKicked(
  io: Server,
  roomCode: string,
  targetPublisherId: string,
): Promise<void> {
  const targetSockets = await io.in(roomCode).fetchSockets();
  for (const remote of targetSockets) {
    if (remote.data.participantId === targetPublisherId) {
      remote.emit(SOCKET_EVENTS.PUBLISHER_KICKED, { roomCode });
      remote.leave(roomCode);
    }
  }
}

export async function broadcastRoomUpdates(
  io: Server,
  roomService: RoomService,
  roomCode: string,
  room: Room | null,
): Promise<void> {
  if (!room) {
    return;
  }

  const participants = await roomService.getParticipants(roomCode);
  io.to(roomCode).emit(SOCKET_EVENTS.ROOM_STATE, { room, participants });

  const publisherState = await roomService.getActivePublisherState(roomCode);
  io.to(roomCode).emit(SOCKET_EVENTS.ACTIVE_PUBLISHER_STATE, publisherState);

  const layout = await roomService.getStreamLayout(roomCode);
  io.to(roomCode).emit(SOCKET_EVENTS.STREAM_LAYOUT_STATE, layout);
}

export async function kickPublisherWithSync(
  io: Server,
  roomService: RoomService,
  roomCode: string,
  requesterId: string,
  targetPublisherId: string,
): Promise<Room | null> {
  const room = await roomService.kickPublisher(roomCode, requesterId, targetPublisherId);
  await notifyPublisherKicked(io, roomCode, targetPublisherId);
  await broadcastRoomUpdates(io, roomService, roomCode, room);
  return room;
}
