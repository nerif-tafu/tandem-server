import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';

import { SOCKET_EVENTS } from '@tandem/shared';

import { Button } from '../../components/ui';
import { cn } from '../../lib/cn';

interface ClickerPanelProps {
  socket: Socket | null;
  connected: boolean;
  roomCode: string;
  participantId: string;
  size?: 'default' | 'compact' | 'large';
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

export function ClickerPanel({
  socket,
  connected,
  roomCode,
  participantId,
  size = 'default',
}: ClickerPanelProps) {
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(sending);

  sendingRef.current = sending;

  const sendSlide = useCallback(
    (direction: 'forward' | 'back'): void => {
      if (!socket || !connected || sendingRef.current) {
        return;
      }

      setSending(true);
      socket.emit(
        direction === 'forward' ? SOCKET_EVENTS.SLIDE_FORWARD : SOCKET_EVENTS.SLIDE_BACK,
        { roomCode, participantId },
        () => setSending(false),
      );

      window.setTimeout(() => setSending(false), 300);
    },
    [socket, connected, roomCode, participantId],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (isTypingTarget(event.target)) {
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        sendSlide('forward');
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        sendSlide('back');
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sendSlide]);

  const buttonClass =
    size === 'large' ? 'h-16 text-base md:h-20 md:text-lg' : size === 'compact' ? 'h-11' : undefined;

  return (
    <div
      className={cn(
        'shrink-0 rounded-2xl border border-border bg-card shadow-md',
        size === 'large' ? 'p-4 md:p-5' : size === 'compact' ? 'p-3' : 'p-6',
      )}
    >
      {size === 'default' && <h2 className="mb-1 text-lg font-semibold">Virtual clicker</h2>}
      <div className={cn('grid grid-cols-2', size === 'large' ? 'gap-4' : 'gap-3')}>
        <Button
          variant="secondary"
          className={buttonClass}
          aria-label="Previous slide"
          disabled={!connected || sending}
          onClick={() => sendSlide('back')}
        >
          ← Back
        </Button>
        <Button
          className={buttonClass}
          aria-label="Next slide"
          disabled={!connected || sending}
          onClick={() => sendSlide('forward')}
        >
          Forward →
        </Button>
      </div>
      {!connected && (
        <p className="mt-2 text-sm text-muted-foreground">Connecting to room…</p>
      )}
    </div>
  );
}
