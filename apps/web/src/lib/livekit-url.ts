import { isLoopbackHost, resolveLiveKitUrlForClient } from '@tandem/shared';

export { isLoopbackHost };

export function isFirefox(): boolean {
  return typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);
}

/** Resolve the LiveKit URL returned by the API for this web client. */
export function resolveLiveKitUrl(serverUrl: string): string {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return resolveLiveKitUrlForClient(serverUrl, window.location.hostname);
  }

  return resolveLiveKitUrlForClient(serverUrl);
}
