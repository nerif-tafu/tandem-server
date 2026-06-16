import { getDefaultServerUrl } from '@tandem/shared';

/** In dev, use the Vite origin so Socket.IO goes through the proxy (same-origin for Firefox). */
export function getServerUrl(): string {
  if (import.meta.env.DEV) {
    return window.location.origin;
  }

  return window.location.origin;
}

export function apiUrl(path: string): string {
  if (import.meta.env.DEV) {
    return path;
  }

  return path;
}

/** Direct API URL for cases that cannot use the Vite proxy (e.g. non-browser clients). */
export function directApiUrl(path: string): string {
  if (import.meta.env.DEV) {
    return `${getDefaultServerUrl(true)}${path}`;
  }

  return path;
}
