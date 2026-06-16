import { useCallback, useState } from 'react';

import {
  DEFAULT_VIEWER_RESOLUTION,
  VIEWER_RESOLUTION_OPTIONS,
  isViewerResolution,
  type ViewerResolution,
} from '@tandem/shared';

const STORAGE_KEY = 'tandem-viewer-resolution';

function readStoredResolution(): ViewerResolution {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isViewerResolution(stored)) {
      return stored;
    }
  } catch {
    // localStorage unavailable
  }

  return DEFAULT_VIEWER_RESOLUTION;
}

export function useViewerResolution() {
  const [resolution, setResolution] = useState<ViewerResolution>(readStoredResolution);

  const updateResolution = useCallback((next: ViewerResolution) => {
    setResolution(next);

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable
    }
  }, []);

  return {
    resolution,
    setResolution: updateResolution,
    options: VIEWER_RESOLUTION_OPTIONS,
  };
}
