import { useCallback, useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import {
  DEFAULT_STREAM_SLOTS,
  SOCKET_EVENTS,
  type ActivePublisherState,
  type AuxSlotLabels,
  type Participant,
  type Room,
  type StreamLayoutState,
  type StreamSlot,
} from '@tandem/shared';

import { getServerUrl } from '../lib/server-url';

interface RoomStatePayload {
  room: Room;
  participants: Participant[];
}

export function useRoomSocket(
  roomCode: string | null,
  participantId: string | null,
  displayName: string | null,
) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [visibleSlots, setVisibleSlots] = useState<StreamSlot[]>([...DEFAULT_STREAM_SLOTS]);
  const [auxLabels, setAuxLabels] = useState<AuxSlotLabels>({});
  const [activePublisherId, setActivePublisherId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode || !participantId || !displayName) {
      return;
    }

    const nextSocket = io(getServerUrl(), {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelayMax: 5000,
    });

    setSocket(nextSocket);

    nextSocket.on('connect', () => {
      nextSocket.emit(SOCKET_EVENTS.ROOM_JOIN, {
        roomCode,
        participantId,
        displayName,
        clientType: 'web',
      });
      setConnected(true);
      setError(null);
    });

    nextSocket.on('disconnect', () => {
      setConnected(false);
    });

    nextSocket.on(SOCKET_EVENTS.ROOM_STATE, (payload: RoomStatePayload) => {
      setRoom(payload.room);
      setParticipants(payload.participants);
    });

    nextSocket.on(SOCKET_EVENTS.STREAM_LAYOUT_STATE, (payload: StreamLayoutState) => {
      setVisibleSlots(payload.visibleSlots);
      setAuxLabels(payload.auxLabels ?? {});
    });

    nextSocket.on(SOCKET_EVENTS.ACTIVE_PUBLISHER_STATE, (payload: ActivePublisherState) => {
      setActivePublisherId(payload.activePublisherId);
    });

    nextSocket.on(SOCKET_EVENTS.ERROR, (payload: { code: string; message: string }) => {
      setError(payload.message);
    });

    return () => {
      nextSocket.disconnect();
      setSocket(null);
      setConnected(false);
      setVisibleSlots([...DEFAULT_STREAM_SLOTS]);
      setAuxLabels({});
      setActivePublisherId(null);
    };
  }, [roomCode, participantId, displayName]);

  const leaveRoom = useCallback(() => {
    if (!socket || !roomCode || !participantId) {
      return;
    }

    socket.emit(SOCKET_EVENTS.ROOM_LEAVE, { roomCode, participantId });
    socket.disconnect();
    setSocket(null);
    setConnected(false);
  }, [socket, roomCode, participantId]);

  return {
    socket,
    room,
    participants,
    visibleSlots,
    auxLabels,
    activePublisherId,
    connected,
    error,
    setError,
    leaveRoom,
  };
}
