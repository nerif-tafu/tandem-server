import { Button, Card } from '../../components/ui';
import { navigate } from '../../lib/navigation';

export function LandingPage() {
  return (
    <main>
      <section className="border-b border-border bg-gradient-to-b from-accent/5 to-background px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-5xl leading-tight md:text-6xl">
            Present together in{' '}
            <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
              tandem
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Stream your deck, presenter notes, and auxiliary feeds to remote co-presenters. Let
            viewers control slides from the browser while you stay focused on stage.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button type="button" onClick={() => navigate('/join')}>
              Join a room
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/download')}>
              Download app
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/wiki')}>
              Read the wiki
            </Button>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Desktop publisher</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Capture screen, webcam, or NDI sources. Publish multiple feeds and choose which
              presenter is live to viewers.
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Web viewer</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Join from any browser to watch streams, adjust quality, and use the remote clicker
              without installing software.
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Built for live events</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Short room codes, optional passwords, multi-presenter rooms, and low-latency
              WebRTC via LiveKit.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
