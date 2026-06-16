import type { ViewerResolution } from '@tandem/shared';

import { LeaveRoomButton } from './leave-room-dialog';
import { StreamQualityMenu } from './stream-quality-menu';

interface SessionHeaderProps {
  roomCode: string;
  displayName: string;
  resolution: ViewerResolution;
  resolutionOptions: readonly ViewerResolution[];
  onResolutionChange: (resolution: ViewerResolution) => void;
  onCopyRoomCode: () => void;
  onToggleFullscreen: () => void;
  onLeaveRoom: () => void;
}

export function FullscreenButton({
  onClick,
  pressed = false,
}: {
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={pressed ? 'Exit fullscreen' : 'Enter fullscreen'}
      aria-pressed={pressed}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted"
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"
        />
      </svg>
    </button>
  );
}

export function SessionHeader({
  roomCode,
  displayName,
  resolution,
  resolutionOptions,
  onResolutionChange,
  onCopyRoomCode,
  onToggleFullscreen,
  onLeaveRoom,
}: SessionHeaderProps) {
  return (
    <header className="shrink-0 border-b border-border bg-muted/30 px-4 py-3">
      <div className="flex items-stretch gap-3">
        <div className="flex shrink-0 flex-col justify-center border-r border-border pr-4">
          <p className="text-xs font-medium text-muted-foreground">Room</p>
          <button
            type="button"
            onClick={onCopyRoomCode}
            className="group text-left"
            aria-label={`Copy room code ${roomCode}`}
            title="Click to copy room code"
          >
            <span className="font-display text-2xl leading-tight transition-colors group-hover:text-accent">
              {roomCode}
            </span>
          </button>
        </div>

        <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-border bg-card lg:flex-row lg:items-stretch">
          <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2.5">
            <p className="truncate text-sm text-foreground">
              Joined as <span className="font-bold">{displayName}</span>
            </p>
          </div>
          <div
            className="h-px shrink-0 bg-border lg:h-auto lg:w-px"
            aria-hidden="true"
          />
          <div
            className="flex items-center justify-center gap-1.5 self-stretch px-2 py-2.5 lg:px-3"
            role="toolbar"
            aria-label="Session actions"
          >
            <StreamQualityMenu
              variant="toolbar"
              value={resolution}
              options={resolutionOptions}
              onChange={onResolutionChange}
            />
            <div className="h-6 w-px shrink-0 bg-border" aria-hidden="true" />
            <FullscreenButton onClick={onToggleFullscreen} />
            <div className="h-6 w-px shrink-0 bg-border" aria-hidden="true" />
            <LeaveRoomButton onClick={onLeaveRoom} />
          </div>
        </div>
      </div>
    </header>
  );
}
