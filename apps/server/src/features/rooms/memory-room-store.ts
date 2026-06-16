import type { AuxSlotLabels, StreamSlot } from '@tandem/shared';
import { DEFAULT_STREAM_SLOTS } from '@tandem/shared';

import type { RoomPasswordRecord } from './room-password.js';

export interface PublisherStreamLayout {
  visibleSlots: StreamSlot[];
  auxLabels: AuxSlotLabels;
}

export interface RoomStore {
  createRoom(room: import('@tandem/shared').Room): Promise<void>;
  getRoomByCode(code: string): Promise<import('@tandem/shared').Room | null>;
  deleteRoom(code: string): Promise<void>;
  addParticipant(code: string, participant: import('@tandem/shared').Participant): Promise<void>;
  removeParticipant(code: string, participantId: string): Promise<void>;
  listParticipants(code: string): Promise<import('@tandem/shared').Participant[]>;
  setSlideIndex(code: string, index: number): Promise<void>;
  getSlideIndex(code: string): Promise<number>;
  getActivePublisherId(code: string): Promise<string | null>;
  setActivePublisherId(code: string, participantId: string | null): Promise<void>;
  setPublisherLayout(code: string, participantId: string, layout: PublisherStreamLayout): Promise<void>;
  getPublisherLayout(code: string, participantId: string): Promise<PublisherStreamLayout>;
  setRoomPassword(code: string, password: RoomPasswordRecord): Promise<void>;
  getRoomPassword(code: string): Promise<RoomPasswordRecord | null>;
}

interface MemoryEntry {
  room: import('@tandem/shared').Room;
  participants: Map<string, import('@tandem/shared').Participant>;
  slideIndex: number;
  activePublisherId: string | null;
  publisherLayouts: Map<string, PublisherStreamLayout>;
  password?: RoomPasswordRecord;
}

function defaultPublisherLayout(): PublisherStreamLayout {
  return {
    visibleSlots: [...DEFAULT_STREAM_SLOTS],
    auxLabels: {},
  };
}

export class MemoryRoomStore implements RoomStore {
  private readonly rooms = new Map<string, MemoryEntry>();

  async createRoom(room: import('@tandem/shared').Room): Promise<void> {
    this.rooms.set(room.code, {
      room,
      participants: new Map(),
      slideIndex: 0,
      activePublisherId: null,
      publisherLayouts: new Map(),
    });
  }

  async getRoomByCode(code: string): Promise<import('@tandem/shared').Room | null> {
    const entry = this.rooms.get(code);
    if (!entry) {
      return null;
    }

    return this.toPublicRoom(entry);
  }

  async deleteRoom(code: string): Promise<void> {
    this.rooms.delete(code);
  }

  async addParticipant(code: string, participant: import('@tandem/shared').Participant): Promise<void> {
    const entry = this.rooms.get(code);
    if (!entry) {
      return;
    }

    entry.participants.set(participant.id, participant);

    if (participant.role === 'publisher' && !entry.publisherLayouts.has(participant.id)) {
      entry.publisherLayouts.set(participant.id, defaultPublisherLayout());
    }
  }

  async removeParticipant(code: string, participantId: string): Promise<void> {
    const entry = this.rooms.get(code);
    if (!entry) {
      return;
    }

    entry.participants.delete(participantId);
    entry.publisherLayouts.delete(participantId);

    if (entry.activePublisherId === participantId) {
      const nextPublisher = [...entry.participants.values()].find(
        (participant) => participant.role === 'publisher',
      );
      entry.activePublisherId = nextPublisher?.id ?? null;
    }
  }

  async listParticipants(code: string): Promise<import('@tandem/shared').Participant[]> {
    const entry = this.rooms.get(code);
    if (!entry) {
      return [];
    }

    return [...entry.participants.values()];
  }

  async setSlideIndex(code: string, index: number): Promise<void> {
    const entry = this.rooms.get(code);
    if (!entry) {
      return;
    }

    entry.slideIndex = index;
  }

  async getSlideIndex(code: string): Promise<number> {
    const entry = this.rooms.get(code);
    return entry?.slideIndex ?? 0;
  }

  async getActivePublisherId(code: string): Promise<string | null> {
    const entry = this.rooms.get(code);
    return entry?.activePublisherId ?? null;
  }

  async setActivePublisherId(code: string, participantId: string | null): Promise<void> {
    const entry = this.rooms.get(code);
    if (!entry) {
      return;
    }

    entry.activePublisherId = participantId;
  }

  async setPublisherLayout(
    code: string,
    participantId: string,
    layout: PublisherStreamLayout,
  ): Promise<void> {
    const entry = this.rooms.get(code);
    if (!entry) {
      return;
    }

    entry.publisherLayouts.set(participantId, {
      visibleSlots: [...layout.visibleSlots],
      auxLabels: { ...layout.auxLabels },
    });
  }

  async getPublisherLayout(code: string, participantId: string): Promise<PublisherStreamLayout> {
    const entry = this.rooms.get(code);
    const layout = entry?.publisherLayouts.get(participantId);
    return layout
      ? {
          visibleSlots: [...layout.visibleSlots],
          auxLabels: { ...layout.auxLabels },
        }
      : defaultPublisherLayout();
  }

  async setRoomPassword(code: string, password: RoomPasswordRecord): Promise<void> {
    const entry = this.rooms.get(code);
    if (!entry) {
      return;
    }

    entry.password = password;
  }

  async getRoomPassword(code: string): Promise<RoomPasswordRecord | null> {
    const entry = this.rooms.get(code);
    return entry?.password ?? null;
  }

  private toPublicRoom(entry: MemoryEntry): import('@tandem/shared').Room {
    const participants = [...entry.participants.values()];
    return {
      ...entry.room,
      participantCount: participants.length,
      hasPublisher: participants.some((participant) => participant.role === 'publisher'),
      passwordProtected: Boolean(entry.password),
    };
  }
}
