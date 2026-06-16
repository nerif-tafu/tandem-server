import {
  type ActivePublisherState,
  type AuxSlotLabels,
  type ClientType,
  type CreateRoomRequest,
  type DesktopPublisher,
  type JoinRoomRequest,
  type Participant,
  type Room,
  type StreamLayoutState,
  type StreamSlot,
  InvalidRoomCodeError,
  InvalidRoomPasswordError,
  RoomCodeTakenError,
  RoomNotFoundError,
  RoomPasswordRequiredError,
  TandemError,
  DEFAULT_STREAM_SLOTS,
  generateRoomCode,
  isValidRoomCodeFormat,
  normalizeAuxSlotLabels,
  normalizeRoomCode,
  normalizeVisibleSlots,
} from '@tandem/shared';
import { randomUUID } from 'node:crypto';

import type { Env } from '../../env.js';
import { hashRoomPassword, verifyRoomPassword } from './room-password.js';
import type { RoomStore } from './memory-room-store.js';

export class RoomService {
  constructor(
    private readonly store: RoomStore,
    private readonly env: Env,
  ) {}

  async createRoom(request: CreateRoomRequest = {}): Promise<Room> {
    const code = request.code ? normalizeRoomCode(request.code) : generateRoomCode();

    if (!isValidRoomCodeFormat(code)) {
      throw new InvalidRoomCodeError();
    }

    const existing = await this.store.getRoomByCode(code);
    if (existing) {
      throw new RoomCodeTakenError(code);
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.env.ROOM_TTL_SECONDS * 1000);

    const room: Room = {
      code,
      id: randomUUID(),
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      participantCount: 0,
      hasPublisher: false,
      passwordProtected: Boolean(request.password),
    };

    await this.store.createRoom(room);

    if (request.password) {
      await this.store.setRoomPassword(code, hashRoomPassword(request.password));
    }

    return room;
  }

  async joinRoom(codeInput: string, request: JoinRoomRequest): Promise<{ room: Room; participant: Participant }> {
    const code = normalizeRoomCode(codeInput);

    if (!isValidRoomCodeFormat(code)) {
      throw new InvalidRoomCodeError();
    }

    const existing = await this.store.getRoomByCode(code);
    if (!existing) {
      throw new RoomNotFoundError(code);
    }

    await this.assertRoomPassword(code, request.password);

    const participants = await this.store.listParticipants(code);
    const role = request.clientType === 'desktop' ? 'publisher' : 'viewer';
    const publisherCount = participants.filter((entry) => entry.role === 'publisher').length;
    const displayName =
      request.clientType === 'desktop'
        ? `Presenter ${publisherCount + 1}`
        : request.displayName;

    const participant: Participant = {
      id: randomUUID(),
      displayName,
      role,
      clientType: request.clientType,
      joinedAt: new Date().toISOString(),
    };

    await this.store.addParticipant(code, participant);

    if (role === 'publisher') {
      const activePublisherId = await this.store.getActivePublisherId(code);
      if (!activePublisherId) {
        await this.store.setActivePublisherId(code, participant.id);
      }
    }

    const room = await this.store.getRoomByCode(code);
    if (!room) {
      throw new RoomNotFoundError(code);
    }

    return { room, participant };
  }

  async getRoom(codeInput: string): Promise<Room> {
    const code = normalizeRoomCode(codeInput);

    if (!isValidRoomCodeFormat(code)) {
      throw new InvalidRoomCodeError();
    }

    const room = await this.store.getRoomByCode(code);
    if (!room) {
      throw new RoomNotFoundError(code);
    }

    return room;
  }

  async leaveRoom(codeInput: string, participantId: string): Promise<Room | null> {
    const code = normalizeRoomCode(codeInput);
    await this.store.removeParticipant(code, participantId);

    const participants = await this.store.listParticipants(code);
    if (participants.length === 0) {
      await this.store.deleteRoom(code);
      return null;
    }

    return this.store.getRoomByCode(code);
  }

  async kickPublisher(
    codeInput: string,
    requesterId: string,
    targetPublisherId: string,
  ): Promise<Room | null> {
    if (requesterId === targetPublisherId) {
      throw new TandemError('FORBIDDEN', 'You cannot remove yourself from the room');
    }

    const code = normalizeRoomCode(codeInput);
    const participants = await this.store.listParticipants(code);
    const requester = participants.find((entry) => entry.id === requesterId);
    const target = participants.find((entry) => entry.id === targetPublisherId);

    if (!requester || requester.role !== 'publisher') {
      throw new TandemError('FORBIDDEN', 'Only a desktop publisher can remove another presenter');
    }

    if (!target || target.role !== 'publisher') {
      throw new TandemError('NOT_FOUND', 'Desktop publisher not found in this room');
    }

    return this.leaveRoom(code, targetPublisherId);
  }

  async advanceSlide(codeInput: string, direction: 'forward' | 'back', participantId: string): Promise<number> {
    const code = normalizeRoomCode(codeInput);
    const current = await this.store.getSlideIndex(code);
    const next = direction === 'forward' ? current + 1 : Math.max(0, current - 1);
    await this.store.setSlideIndex(code, next);
    return next;
  }

  async getParticipants(codeInput: string): Promise<Participant[]> {
    const code = normalizeRoomCode(codeInput);
    return this.store.listParticipants(code);
  }

  async getStreamLayout(codeInput: string): Promise<StreamLayoutState> {
    const code = normalizeRoomCode(codeInput);
    const activePublisherId = await this.store.getActivePublisherId(code);
    const layout = activePublisherId
      ? await this.store.getPublisherLayout(code, activePublisherId)
      : { visibleSlots: [...DEFAULT_STREAM_SLOTS], auxLabels: {} };

    return {
      roomCode: code,
      visibleSlots: layout.visibleSlots,
      auxLabels: layout.auxLabels,
      updatedAt: new Date().toISOString(),
    };
  }

  async updateStreamLayout(
    codeInput: string,
    participantId: string,
    visibleSlots: StreamSlot[],
    auxLabels?: AuxSlotLabels,
  ): Promise<{ layout: StreamLayoutState; broadcast: boolean }> {
    const code = normalizeRoomCode(codeInput);
    const participants = await this.store.listParticipants(code);
    const participant = participants.find((entry) => entry.id === participantId);

    if (!participant || participant.role !== 'publisher') {
      throw new TandemError('FORBIDDEN', 'Only a desktop publisher can update stream layout');
    }

    const normalized = normalizeVisibleSlots(visibleSlots);
    const normalizedLabels = normalizeAuxSlotLabels(auxLabels);

    await this.store.setPublisherLayout(code, participantId, {
      visibleSlots: normalized,
      auxLabels: normalizedLabels,
    });

    const layout: StreamLayoutState = {
      roomCode: code,
      visibleSlots: normalized,
      auxLabels: normalizedLabels,
      updatedAt: new Date().toISOString(),
    };

    const activePublisherId = await this.store.getActivePublisherId(code);
    return { layout, broadcast: activePublisherId === participantId };
  }

  async getActivePublisherState(codeInput: string): Promise<ActivePublisherState> {
    const code = normalizeRoomCode(codeInput);
    const participants = await this.store.listParticipants(code);
    const publishers: DesktopPublisher[] = participants
      .filter((participant) => participant.role === 'publisher')
      .sort((left, right) => left.joinedAt.localeCompare(right.joinedAt))
      .map((participant) => ({
        participantId: participant.id,
        displayName: participant.displayName,
      }));

    return {
      roomCode: code,
      activePublisherId: await this.store.getActivePublisherId(code),
      publishers,
      updatedAt: new Date().toISOString(),
    };
  }

  async setActivePublisher(
    codeInput: string,
    participantId: string,
    activePublisherId: string,
  ): Promise<{ state: ActivePublisherState; layout: StreamLayoutState }> {
    const code = normalizeRoomCode(codeInput);
    const participants = await this.store.listParticipants(code);
    const requester = participants.find((entry) => entry.id === participantId);
    const target = participants.find((entry) => entry.id === activePublisherId);

    if (!requester || requester.role !== 'publisher') {
      throw new TandemError('FORBIDDEN', 'Only a desktop publisher can switch the live feed');
    }

    if (!target || target.role !== 'publisher') {
      throw new TandemError('NOT_FOUND', 'Desktop publisher not found in this room');
    }

    await this.store.setActivePublisherId(code, activePublisherId);

    const publisherLayout = await this.store.getPublisherLayout(code, activePublisherId);
    const layout: StreamLayoutState = {
      roomCode: code,
      visibleSlots: publisherLayout.visibleSlots,
      auxLabels: publisherLayout.auxLabels,
      updatedAt: new Date().toISOString(),
    };

    return {
      state: await this.getActivePublisherState(code),
      layout,
    };
  }

  isPublisher(clientType: ClientType): boolean {
    return clientType === 'desktop';
  }

  private async assertRoomPassword(code: string, password?: string): Promise<void> {
    const record = await this.store.getRoomPassword(code);
    if (!record) {
      return;
    }

    if (!password) {
      throw new RoomPasswordRequiredError();
    }

    if (!verifyRoomPassword(password, record)) {
      throw new InvalidRoomPasswordError();
    }
  }
}
