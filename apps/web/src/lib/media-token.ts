import { MediaTokenResponseSchema, type ParticipantRole } from '@tandem/shared';

import { apiUrl } from './server-url';
import { resolveLiveKitUrl } from './livekit-url';

export async function fetchMediaToken(
  roomCode: string,
  participantId: string,
  role: ParticipantRole,
) {
  const response = await fetch(apiUrl(`/api/rooms/${roomCode}/media-token`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, participantId, role }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch LiveKit token');
  }

  const parsed = MediaTokenResponseSchema.parse(await response.json());
  return {
    ...parsed,
    url: resolveLiveKitUrl(parsed.url),
  };
}
