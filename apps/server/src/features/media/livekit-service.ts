import { AccessToken } from 'livekit-server-sdk';

import { normalizeLiveKitUrl } from '@tandem/shared';
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
    if (clientHostname) {
      const protocol = this.env.LIVEKIT_URL.startsWith('wss://') ? 'wss:' : 'ws:';
      return `${protocol}//${clientHostname}:7880`;
    }

    let url = this.env.LIVEKIT_URL;

    if (url.startsWith('http://')) {
      url = url.replace('http://', 'ws://');
    } else if (url.startsWith('https://')) {
      url = url.replace('https://', 'wss://');
    }

    return normalizeLiveKitUrl(url);
  }

  /** @deprecated Use getClientUrl for browser / SDK clients. */
  getUrl(): string {
    return this.env.LIVEKIT_URL.replace(/^ws/, 'http');
  }
}
