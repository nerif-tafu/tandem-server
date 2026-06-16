import { DEFAULT_STREAM_SLOTS, resolveSlotLabel, type AuxSlotLabels, type StreamSlot, type ViewerResolution } from '@tandem/shared';

import { VideoTrack } from '../../components/video-track';
import { FirefoxIceNotice } from '../../components/firefox-ice-notice';
import { Card } from '../../components/ui';
import { useLiveKitViewer } from '../../hooks/use-livekit-viewer';
import { cn } from '../../lib/cn';

export type StreamViewerLayout = 'standard' | 'expanded' | 'fullscreen';

interface StreamViewerProps {
  roomCode: string;
  participantId: string;
  hasPublisher: boolean;
  visibleSlots?: StreamSlot[];
  auxLabels?: AuxSlotLabels;
  activePublisherId?: string | null;
  resolution: ViewerResolution;
  layout?: StreamViewerLayout;
}

function gridLayoutClass(slotCount: number, layout: StreamViewerLayout): string {
  if (layout === 'standard') {
    return slotCount <= 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-2';
  }

  if (slotCount <= 2) {
    return 'grid-cols-1 lg:grid-cols-2 lg:grid-rows-1';
  }

  return 'grid-cols-1 sm:grid-cols-2 sm:grid-rows-2';
}

function waitingLabel(slot: StreamSlot, hasPublisher: boolean): string {
  if (!hasPublisher) {
    return slot === 'main' ? 'Desktop client not connected' : 'Feed unavailable';
  }

  if (slot === 'main') {
    return 'Waiting for LiveKit stream…';
  }

  if (slot === 'notes') {
    return 'Notes feed will appear here';
  }

  return 'Waiting for auxiliary feed…';
}

export function StreamViewer({
  roomCode,
  participantId,
  hasPublisher,
  visibleSlots = [...DEFAULT_STREAM_SLOTS],
  auxLabels = {},
  activePublisherId = null,
  resolution,
  layout = 'standard',
}: StreamViewerProps) {
  const { tracks } = useLiveKitViewer(
    roomCode,
    participantId,
    hasPublisher,
    resolution,
    activePublisherId,
  );

  const fillHeight = layout !== 'standard';

  return (
    <div className={cn('flex min-h-0 flex-col', fillHeight && 'flex-1')}>
      {(layout !== 'fullscreen' || !fillHeight) && (
        <div className="mb-2 shrink-0">
          <FirefoxIceNotice />
        </div>
      )}

      <div
        className={cn(
          'grid gap-3',
          gridLayoutClass(visibleSlots.length, layout),
          fillHeight && 'h-full min-h-0',
        )}
      >
        {visibleSlots.map((slot) => {
          const label = resolveSlotLabel(slot, auxLabels);

          return (
            <Card
              key={slot}
              className={cn(
                'flex min-h-0 flex-col overflow-hidden p-0',
                fillHeight && 'min-h-[180px]',
              )}
            >
              <div
                className={cn(
                  'shrink-0 border-b border-border',
                  fillHeight ? 'px-4 py-2' : 'px-6 py-4',
                )}
              >
                <h2 className={cn('font-semibold', fillHeight && 'text-sm')}>{label}</h2>
              </div>
              <div className={cn('relative', fillHeight && 'min-h-0 flex-1')}>
                <VideoTrack
                  track={tracks[slot]}
                  label={label}
                  waitingLabel={waitingLabel(slot, hasPublisher)}
                  fillHeight={fillHeight}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
