import { useEffect, useState } from 'react';

import { usePathname } from './lib/navigation';
import { SiteLayout } from './components/site-layout';
import { LandingPage } from './features/landing/landing-page';
import { JoinPage, type JoinSession } from './features/join/join-page';
import { WikiPage } from './features/wiki/wiki-page';
import { DownloadPage } from './features/download/download-page';
import { RoomSessionView } from './features/room/room-session-view';
import { navigate } from './lib/navigation';

export function App() {
  const pathname = usePathname();
  const [search, setSearch] = useState(window.location.search);
  const [session, setSession] = useState<JoinSession | null>(null);

  useEffect(() => {
    function onPopState(): void {
      setSearch(window.location.search);
    }

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  if (session) {
    return (
      <RoomSessionView
        session={session}
        onLeave={() => {
          setSession(null);
          navigate('/');
        }}
      />
    );
  }

  if (pathname.startsWith('/wiki')) {
    return (
      <SiteLayout>
        <WikiPage />
      </SiteLayout>
    );
  }

  if (pathname.startsWith('/download')) {
    return (
      <SiteLayout>
        <DownloadPage />
      </SiteLayout>
    );
  }

  if (pathname.startsWith('/join') || pathname.startsWith('/room/')) {
    return (
      <SiteLayout>
        <JoinPage
          pathname={pathname}
          search={search}
          onJoined={(nextSession) => setSession(nextSession)}
        />
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <LandingPage />
    </SiteLayout>
  );
}
