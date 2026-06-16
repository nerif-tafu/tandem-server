import { useEffect, useState } from 'react';

import { JoinRoomResponseSchema, buildRoomWebPath, parseRoomWebLocation } from '@tandem/shared';

import { Button, Card } from '../../components/ui';
import { apiUrl } from '../../lib/server-url';
import { navigate } from '../../lib/navigation';

export type JoinSession = {
  roomCode: string;
  participantId: string;
  displayName: string;
  hasPublisher: boolean;
};

function readJoinFormFromUrl(pathname: string, search: string): { roomCode: string; displayName: string } {
  const fromRoom = parseRoomWebLocation(pathname, search);
  if (fromRoom.roomCode) {
    return {
      roomCode: fromRoom.roomCode,
      displayName: fromRoom.displayName ?? '',
    };
  }

  const params = new URLSearchParams(search);
  const code = params.get('code')?.trim().toUpperCase() ?? '';
  const name = params.get('name')?.trim() ?? '';

  return { roomCode: code, displayName: name };
}

interface JoinPageProps {
  pathname: string;
  search: string;
  onJoined: (session: JoinSession) => void;
}

export function JoinPage({ pathname, search, onJoined }: JoinPageProps) {
  const initial = readJoinFormFromUrl(pathname, search);
  const [roomCode, setRoomCode] = useState(initial.roomCode);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const next = readJoinFormFromUrl(pathname, search);
    setRoomCode(next.roomCode);
    setDisplayName(next.displayName);
  }, [pathname, search]);

  async function joinRoom(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl(`/api/rooms/${roomCode.trim().toUpperCase()}/join`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim(),
          clientType: 'web',
          password: password.trim() || undefined,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error?.message ?? 'Failed to join room');
      }

      const parsed = JoinRoomResponseSchema.parse(payload);
      onJoined({
        roomCode: parsed.room.code,
        participantId: parsed.participant.id,
        displayName: parsed.participant.displayName,
        hasPublisher: parsed.room.hasPublisher,
      });

      navigate(buildRoomWebPath(parsed.room.code, parsed.participant.displayName), true);
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : 'Failed to join room');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-xl">
        <Card>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Join a{' '}
            <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
              tandem
            </span>{' '}
            room
          </h1>
          <p className="mt-4 text-muted-foreground">
            Enter the room code from the presenter desktop app to view streams and control slides.
          </p>

          <form className="mt-8 space-y-4" onSubmit={joinRoom}>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Room code</span>
              <input
                className="h-12 w-full rounded-xl border border-border bg-transparent px-4 uppercase tracking-[0.3em] outline-none focus:ring-2 focus:ring-ring"
                maxLength={5}
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                placeholder="ABCDE"
                required
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Your name</span>
              <input
                className="h-12 w-full rounded-xl border border-border bg-transparent px-4 outline-none focus:ring-2 focus:ring-ring"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Alex"
                required
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Room password (if required)</span>
              <input
                type="password"
                className="h-12 w-full rounded-xl border border-border bg-transparent px-4 outline-none focus:ring-2 focus:ring-ring"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Optional"
                autoComplete="current-password"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Joining…' : 'Join room'}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
