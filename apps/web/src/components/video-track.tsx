import { useEffect, useRef } from 'react';
import type { RemoteTrack } from 'livekit-client';

interface VideoTrackProps {
  track: RemoteTrack | undefined;
  label: string;
  waitingLabel: string;
  fillHeight?: boolean;
}

export function VideoTrack({ track, label, waitingLabel, fillHeight = false }: VideoTrackProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !track) {
      return;
    }

    track.attach(element);
    element.style.objectFit = 'contain';
    element.style.objectPosition = 'center';

    return () => {
      track.detach(element);
    };
  }, [track]);

  if (!track) {
    return (
      <div
        className={
          fillHeight
            ? 'video-playback-container-fill flex items-center justify-center text-sm text-muted-foreground'
            : 'video-playback-container flex items-center justify-center bg-muted text-sm text-muted-foreground'
        }
      >
        {waitingLabel}
      </div>
    );
  }

  return (
    <div className={fillHeight ? 'video-playback-container-fill' : 'video-playback-container'}>
      <video
        ref={videoRef}
        className="video-playback-media"
        autoPlay
        playsInline
        muted
        aria-label={label}
      />
    </div>
  );
}
