import { Track, type RemoteTrackPublication } from 'livekit-client';

import { VIEWER_RESOLUTION_DIMENSIONS, type ViewerResolution } from '@tandem/shared';

export function applyViewerResolution(
  publication: RemoteTrackPublication,
  resolution: ViewerResolution,
): void {
  if (publication.kind !== Track.Kind.Video) {
    return;
  }

  const { width, height } = VIEWER_RESOLUTION_DIMENSIONS[resolution];
  publication.setVideoDimensions({ width, height });
}
