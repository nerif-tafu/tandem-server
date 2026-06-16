import { useEffect, useRef, useState } from 'react';

import { LeaveRoomDialog } from '../../components/leave-room-dialog';
import { SessionHeader } from '../../components/session-header';
import { useRoomSocket } from '../../hooks/use-room-socket';
import { useViewerResolution } from '../../hooks/use-viewer-resolution';
import { cn } from '../../lib/cn';
import { ClickerPanel } from './clicker-panel';
import { StreamViewer } from './stream-viewer';

type Session = {
  roomCode: string;
  participantId: string;
  displayName: string;
  hasPublisher: boolean;
};

interface RoomSessionViewProps {
  session: Session;
  onLeave: () => void;
}

export function RoomSessionView({ session, onLeave }: RoomSessionViewProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const layoutRef = useRef<HTMLElement>(null);
  const { resolution, setResolution, options: resolutionOptions } = useViewerResolution();
  const { socket, connected, visibleSlots, auxLabels, activePublisherId, leaveRoom } = useRoomSocket(
    session.roomCode,
    session.participantId,
    session.displayName,
  );

  useEffect(() => {
    function onFullscreenChange(): void {
      if (!document.fullscreenElement) {
        setFullscreen(false);
      }
    }

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  async function toggleFullscreen(): Promise<void> {
    if (fullscreen) {
      setFullscreen(false);
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      return;
    }

    setFullscreen(true);
    try {
      await layoutRef.current?.requestFullscreen();
    } catch {
      // CSS fullscreen still applies when the Fullscreen API is unavailable.
    }
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Escape' || !fullscreen) {
        return;
      }

      void (async () => {
        setFullscreen(false);
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      })();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fullscreen]);

  async function copyRoomCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(session.roomCode);
    } catch {
      // Clipboard unavailable
    }
  }

  function confirmLeaveRoom(): void {
    leaveRoom();
    setLeaveOpen(false);
    onLeave();
  }

  const streamLayout = fullscreen ? 'fullscreen' : 'expanded';

  return (
    <main
      ref={layoutRef}
      className={cn(
        'flex h-dvh flex-col overflow-hidden bg-background',
        fullscreen && 'fixed inset-0 z-50',
      )}
    >
      <LeaveRoomDialog
        open={leaveOpen}
        roomCode={session.roomCode}
        onClose={() => setLeaveOpen(false)}
        onConfirm={confirmLeaveRoom}
      />

      {!fullscreen && (
        <SessionHeader
          roomCode={session.roomCode}
          displayName={session.displayName}
          resolution={resolution}
          resolutionOptions={resolutionOptions}
          onResolutionChange={setResolution}
          onCopyRoomCode={() => void copyRoomCode()}
          onToggleFullscreen={() => void toggleFullscreen()}
          onLeaveRoom={() => setLeaveOpen(true)}
        />
      )}

      <div className={cn('flex min-h-0 flex-1 flex-col gap-3', !fullscreen && 'px-4 py-3')}>
        <StreamViewer
          roomCode={session.roomCode}
          participantId={session.participantId}
          hasPublisher={session.hasPublisher}
          visibleSlots={visibleSlots}
          auxLabels={auxLabels}
          activePublisherId={activePublisherId}
          resolution={resolution}
          layout={streamLayout}
        />
        <ClickerPanel
          socket={socket}
          connected={connected}
          roomCode={session.roomCode}
          participantId={session.participantId}
          size={fullscreen ? 'large' : 'compact'}
        />
      </div>
    </main>
  );
}
