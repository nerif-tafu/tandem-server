import { AccessToken } from 'livekit-server-sdk';

import { resolveLiveKitUrlForClient } from '@tandem/shared';
import type { ParticipantRole } from '@tandem/shared';

import type { Env } from '../../env.js';

export class LiveKitService {
  constructor(private readonly env: Env) {}

  createToken(roomCode: string, participantId: string, role: ParticipantRole): Promise<string> {
    const token = new AccessToken(this.env.LIVEKIT_API_KEY, this.env.LIVEKIT_API_SECRET, {
      identity: participantId,
      ttl: '1h',
    });

    token.addGrant({
      roomJoin: true,
      room: roomCode,
      canPublish: role === 'publisher',
      canSubscribe: true,
    });

    return token.toJwt();
  }

  getClientUrl(clientHostname?: string): string {
    return resolveLiveKitUrlForClient(
      this.env.LIVEKIT_URL,
      clientHostname,
      this.env.LIVEKIT_PUBLIC_URL,
    );
  }

  /** @deprecated Use getClientUrl for browser / SDK clients. */
  getUrl(): string {
    return this.env.LIVEKIT_URL.replace(/^ws/, 'http');
  }
}
