import { useEffect, useState } from 'react';

import { parseRoomWebLocation } from '@tandem/shared';

export type AppRoute = 'landing' | 'join' | 'wiki' | 'download' | 'room';

export type WikiSectionId =
  | 'overview'
  | 'getting-started'
  | 'desktop'
  | 'web-viewer'
  | 'rooms'
  | 'streaming'
  | 'remote-clicker'
  | 'api-rest'
  | 'api-socket'
  | 'errors';

export function parseAppRoute(pathname: string): AppRoute {
  if (pathname === '/' || pathname === '') {
    return 'landing';
  }

  if (pathname.startsWith('/wiki')) {
    return 'wiki';
  }

  if (pathname.startsWith('/download')) {
    return 'download';
  }

  if (pathname.startsWith('/join')) {
    return 'join';
  }

  if (parseRoomWebLocation(pathname, '').roomCode) {
    return 'room';
  }

  return 'landing';
}

export function parseWikiSection(pathname: string): WikiSectionId {
  const slug = pathname.replace(/^\/wiki\/?/, '').replace(/\/$/, '');
  const valid: WikiSectionId[] = [
    'overview',
    'getting-started',
    'desktop',
    'web-viewer',
    'rooms',
    'streaming',
    'remote-clicker',
    'api-rest',
    'api-socket',
    'errors',
  ];

  if (valid.includes(slug as WikiSectionId)) {
    return slug as WikiSectionId;
  }

  return 'overview';
}

export function wikiPath(section: WikiSectionId): string {
  return section === 'overview' ? '/wiki' : `/wiki/${section}`;
}

export function navigate(path: string, replace = false): void {
  if (replace) {
    window.history.replaceState(null, '', path);
  } else {
    window.history.pushState(null, '', path);
  }

  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function usePathname(): string {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    function onPopState(): void {
      setPathname(window.location.pathname);
    }

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return pathname;
}
