import type { WikiSectionId } from '../../lib/navigation';
import {
  WikiArticle,
  WikiCode,
  WikiH2,
  WikiH3,
  WikiP,
  WikiTable,
  WikiUl,
} from './wiki-primitives';

export const WIKI_NAV: { id: WikiSectionId; label: string; group?: string }[] = [
  { id: 'overview', label: 'Overview', group: 'Guide' },
  { id: 'getting-started', label: 'Getting started', group: 'Guide' },
  { id: 'desktop', label: 'Desktop app', group: 'Guide' },
  { id: 'web-viewer', label: 'Web viewer', group: 'Guide' },
  { id: 'rooms', label: 'Rooms & presenters', group: 'Guide' },
  { id: 'streaming', label: 'Streaming', group: 'Guide' },
  { id: 'remote-clicker', label: 'Remote clicker', group: 'Guide' },
  { id: 'local-development', label: 'Local development', group: 'Developer' },
  { id: 'hosting', label: 'Hosting', group: 'Developer' },
  { id: 'api-rest', label: 'REST API', group: 'API' },
  { id: 'api-socket', label: 'Socket API', group: 'API' },
  { id: 'errors', label: 'Error codes', group: 'API' },
];

export function WikiSectionContent({ section }: { section: WikiSectionId }) {
  switch (section) {
    case 'overview':
      return <OverviewSection />;
    case 'getting-started':
      return <GettingStartedSection />;
    case 'desktop':
      return <DesktopSection />;
    case 'web-viewer':
      return <WebViewerSection />;
    case 'rooms':
      return <RoomsSection />;
    case 'streaming':
      return <StreamingSection />;
    case 'remote-clicker':
      return <RemoteClickerSection />;
    case 'local-development':
      return <LocalDevelopmentSection />;
    case 'hosting':
      return <HostingSection />;
    case 'api-rest':
      return <ApiRestSection />;
    case 'api-socket':
      return <ApiSocketSection />;
    case 'errors':
      return <ErrorsSection />;
    default:
      return <OverviewSection />;
  }
}

function OverviewSection() {
  return (
    <WikiArticle>
      <WikiH2 id="overview">What is Tandem?</WikiH2>
      <WikiP>
        Tandem helps remote teams follow a live presentation. Someone in the room runs the desktop
        app and shares video from their main deck, notes, or extra cameras. Co-presenters and
        operators open the website, watch those feeds, and can advance slides from afar.
      </WikiP>
      <WikiH3 id="who-uses-it">Who uses it?</WikiH3>
      <WikiUl>
        <li>
          <strong className="text-foreground">In-person presenter.</strong> Runs the desktop app,
          shares screens and cameras, and receives slide commands on the machine running the deck.
        </li>
        <li>
          <strong className="text-foreground">Remote co-presenter or operator.</strong> Joins from
          the web, watches the live feeds, and uses the remote clicker.
        </li>
      </WikiUl>
    </WikiArticle>
  );
}

function WikiOl({ children }: { children: React.ReactNode }) {
  return <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">{children}</ol>;
}

function GettingStartedSection() {
  return (
    <WikiArticle>
      <WikiH2 id="getting-started">Getting started</WikiH2>
      <WikiH3 id="quick-start">Quick start</WikiH3>
      <WikiOl>
        <li>
          <a href="/download" className="text-accent underline-offset-2 hover:underline">
            Download
          </a>{' '}
          and install the desktop app
        </li>
        <li>Open the desktop app and create a room. Write down the 5-character room code.</li>
        <li>Assign capture sources (screen, webcam, or NDI) to each slot you need</li>
        <li>
          Open this website, go to <strong className="text-foreground">Join room</strong>, enter the
          code and your name
        </li>
        <li>Use the remote clicker or arrow keys to advance slides on the presenter machine</li>
      </WikiOl>
      <WikiH3 id="invite-link">Invite link</WikiH3>
      <WikiP>
        From the desktop app, tap <strong className="text-foreground">Share</strong> to copy an
        invite link. Links look like{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">/room/ABCDE?name=Alex</code>.
        Anyone who opens that URL gets the room code and name filled in for them.
      </WikiP>
    </WikiArticle>
  );
}

function DesktopSection() {
  return (
    <WikiArticle>
      <WikiH2 id="desktop">Desktop app</WikiH2>
      <WikiP>
        The desktop app is what publishes video into a room. Each machine that joins becomes its
        own presenter with its own capture layout and clicker target.
      </WikiP>
      <WikiH3 id="capture-sources">Capture sources</WikiH3>
      <WikiUl>
        <li><strong className="text-foreground">Screen:</strong> share a display</li>
        <li><strong className="text-foreground">Webcam:</strong> share a camera</li>
        <li><strong className="text-foreground">NDI:</strong> share a network video source (Windows only)</li>
      </WikiUl>
      <WikiH3 id="stream-slots">Stream slots</WikiH3>
      <WikiP>Each room supports up to four named slots:</WikiP>
      <WikiTable>
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className="px-4 py-2 font-medium">Slot</th>
            <th className="px-4 py-2 font-medium">Default label</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          <tr><td className="px-4 py-2 font-mono">main</td><td className="px-4 py-2">Main presentation</td></tr>
          <tr><td className="px-4 py-2 font-mono">notes</td><td className="px-4 py-2">Presenter notes</td></tr>
          <tr><td className="px-4 py-2 font-mono">aux1</td><td className="px-4 py-2">Auxiliary 1 (custom label supported)</td></tr>
          <tr><td className="px-4 py-2 font-mono">aux2</td><td className="px-4 py-2">Auxiliary 2 (custom label supported)</td></tr>
        </tbody>
      </WikiTable>
      <WikiH3 id="live-feed">Live feed switcher</WikiH3>
      <WikiP>
        When more than one desktop presenter is in a room, anyone can pick whose feeds the web
        audience sees. You can also remove another presenter from the room.
      </WikiP>
      <WikiH3 id="clicker-target">Clicker target</WikiH3>
      <WikiP>
        Pick which presentation window should receive forward and back commands from the web clicker.
        Only the active presenter&apos;s computer acts on those commands.
      </WikiP>
    </WikiArticle>
  );
}

function WebViewerSection() {
  return (
    <WikiArticle>
      <WikiH2 id="web-viewer">Web viewer</WikiH2>
      <WikiP>
        Join a room from the browser to watch as a viewer. You&apos;ll see video from whichever
        slots the active presenter has turned on.
      </WikiP>
      <WikiH3 id="session-header">Session header</WikiH3>
      <WikiUl>
        <li><strong className="text-foreground">Room code:</strong> click to copy</li>
        <li><strong className="text-foreground">Joined as:</strong> your display name</li>
        <li><strong className="text-foreground">Stream quality:</strong> 480p, 720p, or 1080p for all feeds</li>
        <li>Fullscreen and leave room buttons</li>
      </WikiUl>
      <WikiH3 id="keyboard">Keyboard shortcuts</WikiH3>
      <WikiUl>
        <li><kbd className="rounded border border-border bg-muted px-1.5 font-mono text-xs">←</kbd> Previous slide</li>
        <li><kbd className="rounded border border-border bg-muted px-1.5 font-mono text-xs">→</kbd> Next slide</li>
        <li><kbd className="rounded border border-border bg-muted px-1.5 font-mono text-xs">Escape</kbd> Exit fullscreen</li>
      </WikiUl>
    </WikiArticle>
  );
}

function RoomsSection() {
  return (
    <WikiArticle>
      <WikiH2 id="rooms">Rooms &amp; presenters</WikiH2>
      <WikiH3 id="room-codes">Room codes</WikiH3>
      <WikiP>
        Room codes are five characters from A-Z and 2-9 (letters like O and I are left out on
        purpose). Rooms expire after a while (eight hours by default). You can optionally set a
        password when creating a room.
      </WikiP>
      <WikiH3 id="roles">Roles</WikiH3>
      <WikiTable>
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className="px-4 py-2 font-medium">clientType</th>
            <th className="px-4 py-2 font-medium">role</th>
            <th className="px-4 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          <tr>
            <td className="px-4 py-2 font-mono">desktop</td>
            <td className="px-4 py-2 font-mono">publisher</td>
            <td className="px-4 py-2">Captures and publishes media</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-mono">web</td>
            <td className="px-4 py-2 font-mono">viewer</td>
            <td className="px-4 py-2">Watches streams and sends slide commands</td>
          </tr>
        </tbody>
      </WikiTable>
      <WikiH3 id="multi-presenter">Multiple presenters</WikiH3>
      <WikiP>
        Every desktop that joins gets a name like Presenter 1 or Presenter 2. One presenter is{' '}
        <strong className="text-foreground">active</strong> at a time, and web viewers only see
        that person&apos;s feeds.
      </WikiP>
    </WikiArticle>
  );
}

function StreamingSection() {
  return (
    <WikiArticle>
      <WikiH2 id="streaming">Streaming</WikiH2>
      <WikiP>
        The desktop app sends live video for each slot you turn on (main, notes, aux feeds). Viewers
        on the web see those streams in real time and can pick 480p, 720p, or 1080p from the session
        header.
      </WikiP>
      <WikiH3 id="layout-sync">What viewers see</WikiH3>
      <WikiP>
        You choose which slots are visible and can rename the auxiliary feeds. If several presenters
        are in the room, viewers follow whoever is currently active.
      </WikiP>
    </WikiArticle>
  );
}

function RemoteClickerSection() {
  return (
    <WikiArticle>
      <WikiH2 id="remote-clicker">Remote clicker</WikiH2>
      <WikiP>
        Viewers on the web can move slides forward or back from the clicker panel or with the arrow
        keys. Those commands go to the active presenter&apos;s machine and into the presentation
        window they selected.
      </WikiP>
    </WikiArticle>
  );
}

function LocalDevelopmentSection() {
  return (
    <WikiArticle>
      <WikiH2 id="local-development">Local development</WikiH2>
      <WikiP>
        Tandem lives in two repos:{' '}
        <a
          href="https://github.com/nerif-tafu/tandem-server"
          className="text-accent underline-offset-2 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          tandem-server
        </a>{' '}
        (this website and API) and{' '}
        <a
          href="https://github.com/nerif-tafu/tandem-desktop"
          className="text-accent underline-offset-2 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          tandem-desktop
        </a>{' '}
        (the desktop publisher). You need Node.js 22+, pnpm, and Docker for Redis and LiveKit. Add
        Rust if you work on the desktop app.
      </WikiP>

      <WikiH3 id="default-ports">Default ports</WikiH3>
      <WikiTable>
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className="px-4 py-2 font-medium">Service</th>
            <th className="px-4 py-2 font-medium">Port</th>
            <th className="px-4 py-2 font-medium">Address</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm">
          <tr>
            <td className="px-4 py-2">API server</td>
            <td className="px-4 py-2 font-mono">3841</td>
            <td className="px-4 py-2 font-mono text-xs">http://127.0.0.1:3841</td>
          </tr>
          <tr>
            <td className="px-4 py-2">Web dev server</td>
            <td className="px-4 py-2 font-mono">5173</td>
            <td className="px-4 py-2 font-mono text-xs">http://localhost:5173</td>
          </tr>
          <tr>
            <td className="px-4 py-2">Desktop dev UI (Vite)</td>
            <td className="px-4 py-2 font-mono">3842</td>
            <td className="px-4 py-2 font-mono text-xs">http://127.0.0.1:3842</td>
          </tr>
          <tr>
            <td className="px-4 py-2">Redis</td>
            <td className="px-4 py-2 font-mono">6379</td>
            <td className="px-4 py-2 font-mono text-xs">redis://127.0.0.1:6379</td>
          </tr>
          <tr>
            <td className="px-4 py-2">LiveKit (signaling)</td>
            <td className="px-4 py-2 font-mono">7880</td>
            <td className="px-4 py-2 font-mono text-xs">ws://127.0.0.1:7880</td>
          </tr>
          <tr>
            <td className="px-4 py-2">LiveKit (RTC)</td>
            <td className="px-4 py-2 font-mono">7881</td>
            <td className="px-4 py-2 text-muted-foreground">TCP</td>
          </tr>
          <tr>
            <td className="px-4 py-2">LiveKit (TURN)</td>
            <td className="px-4 py-2 font-mono">3478</td>
            <td className="px-4 py-2 text-muted-foreground">UDP</td>
          </tr>
        </tbody>
      </WikiTable>
      <WikiP>
        LiveKit also needs UDP ranges <code className="font-mono text-sm">30000-30002</code> and{' '}
        <code className="font-mono text-sm">50000-50060</code> for media. See{' '}
        <code className="font-mono text-sm">docker/docker-compose.yml</code> in tandem-server.
      </WikiP>

      <WikiH3 id="dev-server">Run the server</WikiH3>
      <WikiP>Clone tandem-server, install packages, and start Redis and LiveKit:</WikiP>
      <WikiCode>{`git clone https://github.com/nerif-tafu/tandem-server.git
cd tandem-server
pnpm install

cp docker/.env.example docker/.env
docker compose -f docker/docker-compose.yml up -d`}</WikiCode>
      <WikiP>In two more terminals, start the API and web UI:</WikiP>
      <WikiCode>{`pnpm dev:server   # :3841
pnpm dev:web      # :5173`}</WikiCode>
      <WikiP>
        The web dev server on port 5173 proxies <code className="font-mono text-sm">/api</code> and{' '}
        <code className="font-mono text-sm">/socket.io</code> to the API on 3841.
      </WikiP>

      <WikiH3 id="dev-desktop">Run the desktop app</WikiH3>
      <WikiP>With the server stack above already running:</WikiP>
      <WikiCode>{`git clone https://github.com/nerif-tafu/tandem-desktop.git
cd tandem-desktop
pnpm install
pnpm dev`}</WikiCode>
      <WikiP>
        <code className="font-mono text-sm">pnpm dev</code> builds the shared package and opens the
        desktop window. The dev UI loads from port 3842 and talks to the API on 3841. Release builds
        default to <code className="font-mono text-sm">https://tandem.tafu.casa</code>.
      </WikiP>
    </WikiArticle>
  );
}

function HostingSection() {
  return (
    <WikiArticle>
      <WikiH2 id="hosting">Hosting</WikiH2>
      <WikiP>
        The published server image bundles the API and the built web app in one container. It listens
        on port 3841 by default and serves the site from <code className="font-mono text-sm">STATIC_WEB_DIR</code>{' '}
        (already set inside the image).
      </WikiP>

      <WikiH3 id="hosting-image">Pull the server image</WikiH3>
      <WikiP>
        Official builds are on GitHub Container Registry (GHCR). Pull the image you want to run:
      </WikiP>
      <WikiCode>{`docker pull ghcr.io/nerif-tafu/tandem-server:latest`}</WikiCode>
      <WikiP>
        If you fork the repo and publish your own packages, replace <code className="font-mono text-sm">nerif-tafu</code>{' '}
        with your GitHub username or org. Private images require{' '}
        <code className="font-mono text-sm">docker login ghcr.io</code> with a personal access token
        that has <code className="font-mono text-sm">read:packages</code>.
      </WikiP>

      <WikiH3 id="hosting-versioning">Image versioning</WikiH3>
      <WikiP>Two tag styles are published from tandem-server CI:</WikiP>
      <WikiUl>
        <li>
          <code className="font-mono text-sm">latest</code>: updated on every push to{' '}
          <code className="font-mono text-sm">main</code>. Good for trying the newest build, not
          ideal if you need a fixed version in production.
        </li>
        <li>
          <code className="font-mono text-sm">1.0.0</code>, <code className="font-mono text-sm">1.1.0</code>, etc.:
          created when you push a semver git tag like <code className="font-mono text-sm">v1.0.0</code>.
          The <code className="font-mono text-sm">v</code> prefix is dropped in the image tag. Pin
          production to one of these so upgrades are deliberate.
        </li>
      </WikiUl>
      <WikiCode>{`docker pull ghcr.io/nerif-tafu/tandem-server:1.0.0`}</WikiCode>

      <WikiH3 id="hosting-containers">Other containers you need</WikiH3>
      <WikiP>
        The server image is only one piece. Tandem also needs <strong className="text-foreground">Redis</strong>{' '}
        (room state) and <strong className="text-foreground">LiveKit</strong> (video streaming). Run
        them alongside the server and point the server at their URLs.
      </WikiP>
      <WikiTable>
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className="px-4 py-2 font-medium">Service</th>
            <th className="px-4 py-2 font-medium">Role</th>
            <th className="px-4 py-2 font-medium">Typical image</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm">
          <tr>
            <td className="px-4 py-2">Tandem server</td>
            <td className="px-4 py-2">API, web UI, Socket.IO</td>
            <td className="px-4 py-2 font-mono text-xs">ghcr.io/nerif-tafu/tandem-server</td>
          </tr>
          <tr>
            <td className="px-4 py-2">Redis</td>
            <td className="px-4 py-2">Room and participant storage</td>
            <td className="px-4 py-2 font-mono text-xs">redis:7-alpine</td>
          </tr>
          <tr>
            <td className="px-4 py-2">LiveKit</td>
            <td className="px-4 py-2">WebRTC media</td>
            <td className="px-4 py-2 font-mono text-xs">livekit/livekit-server</td>
          </tr>
        </tbody>
      </WikiTable>
      <WikiP>
        The repo includes a reference stack in <code className="font-mono text-sm">docker/docker-compose.yml</code>.
        For local dev it runs Redis and LiveKit only; you start the API and web with pnpm. For
        production you can swap the built <code className="font-mono text-sm">server</code> service
        for the GHCR image, or run all three containers yourself with the same env vars. Managed
        Redis or LiveKit Cloud work too as long as{' '}
        <code className="font-mono text-sm">REDIS_URL</code> and the LiveKit settings match.
      </WikiP>
      <WikiP>
        LiveKit needs its TCP and UDP ports open on the host (see the compose file for{' '}
        <code className="font-mono text-sm">7880</code>, <code className="font-mono text-sm">7881</code>,{' '}
        <code className="font-mono text-sm">3478</code>, and the UDP ranges). Set{' '}
        <code className="font-mono text-sm">LIVEKIT_NODE_IP</code> to your server&apos;s public or
        LAN IP so clients receive reachable WebRTC candidates.
      </WikiP>

      <WikiH3 id="hosting-env">Environment variables</WikiH3>
      <WikiUl>
        <li>
          <code className="font-mono text-sm">PORT</code>: listen port (default{' '}
          <code className="font-mono text-sm">3841</code>)
        </li>
        <li>
          <code className="font-mono text-sm">REDIS_URL</code>: Redis connection string (default{' '}
          <code className="font-mono text-sm">redis://127.0.0.1:6379</code> in dev)
        </li>
        <li>
          <code className="font-mono text-sm">LIVEKIT_URL</code>,{' '}
          <code className="font-mono text-sm">LIVEKIT_API_KEY</code>, and{' '}
          <code className="font-mono text-sm">LIVEKIT_API_SECRET</code>: your LiveKit server (dev
          defaults to <code className="font-mono text-sm">ws://localhost:7880</code> with key{' '}
          <code className="font-mono text-sm">devkey</code> / secret{' '}
          <code className="font-mono text-sm">secret</code>)
        </li>
        <li>
          <code className="font-mono text-sm">CORS_ORIGINS</code>: comma-separated origins allowed to
          call the API (include your web URL and any desktop dev origin on 3842)
        </li>
        <li>
          <code className="font-mono text-sm">DESKTOP_RELEASES_REPO</code>: GitHub{' '}
          <code className="font-mono text-sm">owner/repo</code> for the download page (default{' '}
          <code className="font-mono text-sm">nerif-tafu/tandem-desktop</code>)
        </li>
      </WikiUl>
      <WikiP>
        Point desktop and web clients at your public server URL, or ship a desktop build with a
        different default host.
      </WikiP>

      <WikiH3 id="hosting-desktop">Desktop releases</WikiH3>
      <WikiP>Build installers from tandem-desktop:</WikiP>
      <WikiCode>{`pnpm --filter @tandem/shared build
pnpm --filter @tandem/client build`}</WikiCode>
      <WikiP>Tag and push to publish on GitHub Releases:</WikiP>
      <WikiCode>{`git tag v1.0.0
git push origin v1.0.0`}</WikiCode>
      <WikiP>
        Set <code className="font-mono text-sm">DESKTOP_RELEASES_REPO</code> on your server to your
        fork so the{' '}
        <a href="/download" className="text-accent underline-offset-2 hover:underline">
          download page
        </a>{' '}
        lists your builds.
      </WikiP>
    </WikiArticle>
  );
}

function ApiRestSection() {
  return (
    <WikiArticle>
      <WikiH2 id="api-rest">REST API</WikiH2>
      <WikiP>
        All requests go to your Tandem server (for example{' '}
        <code className="font-mono text-sm">http://127.0.0.1:3841</code> in dev). Send JSON with{' '}
        <code className="font-mono text-sm">Content-Type: application/json</code>. Errors come back as{' '}
        <code className="font-mono text-sm">{`{ "error": { "code", "message" } }`}</code>.
      </WikiP>

      <WikiH3 id="health">GET /health</WikiH3>
      <WikiP>Liveness check.</WikiP>
      <WikiCode>{`Response 200: { "status": "ok" }`}</WikiCode>

      <WikiH3 id="create-room">POST /api/rooms</WikiH3>
      <WikiP>Create a room. Desktop app uses this before joining.</WikiP>
      <WikiCode>{`Request body (all optional):
{
  "code": "ABCDE",      // optional custom code
  "password": "secret"  // optional room password
}

Response 201:
{ "room": { "code", "id", "createdAt", "expiresAt", "participantCount", "hasPublisher", "passwordProtected" } }`}</WikiCode>

      <WikiH3 id="get-room">GET /api/rooms/:code</WikiH3>
      <WikiCode>{`Response 200: { "room": { ... } }
404 ROOM_NOT_FOUND`}</WikiCode>

      <WikiH3 id="join-room">POST /api/rooms/:code/join</WikiH3>
      <WikiCode>{`Request:
{
  "displayName": "Alex",
  "clientType": "web" | "desktop",
  "password": "optional"
}

Response 200:
{
  "room": { ... },
  "participant": {
    "id": "uuid",
    "displayName": "Alex",
    "role": "viewer" | "publisher",
    "clientType": "web" | "desktop",
    "joinedAt": "ISO-8601"
  }
}`}</WikiCode>

      <WikiH3 id="media-token-rest">POST /api/rooms/:code/media-token</WikiH3>
      <WikiCode>{`Request:
{
  "roomCode": "ABCDE",
  "participantId": "uuid",
  "role": "publisher" | "viewer"
}

Response 200:
{ "token": "jwt...", "url": "wss://..." }`}</WikiCode>

      <WikiH3 id="kick-rest">POST /api/rooms/:code/kick</WikiH3>
      <WikiP>Remove another desktop publisher from the room (desktop app).</WikiP>
      <WikiCode>{`Request:
{
  "participantId": "requester-uuid",
  "targetPublisherId": "target-uuid"
}

Response 200:
{
  "room": { ... } | null,
  "participants": [ ... ],
  "activePublisherState": { ... }
}

403 FORBIDDEN: not a publisher, or trying to kick yourself
404 NOT_FOUND: target not found`}</WikiCode>
    </WikiArticle>
  );
}

function ApiSocketSection() {
  return (
    <WikiArticle>
      <WikiH2 id="api-socket">Socket.IO API</WikiH2>
      <WikiP>
        Connect to the server root with path <code className="font-mono text-sm">/socket.io</code>.
        After HTTP join, emit <code className="font-mono text-sm">room.join</code> with your
        participant id so the server adds you to the room channel.
      </WikiP>

      <WikiH3 id="client-emits">Client → server events</WikiH3>
      <WikiTable>
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className="px-4 py-2 font-medium">Event</th>
            <th className="px-4 py-2 font-medium">Payload</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm">
          <tr><td className="px-4 py-2 font-mono">room.join</td><td className="px-4 py-2 font-mono text-xs">roomCode, participantId, displayName, clientType</td></tr>
          <tr><td className="px-4 py-2 font-mono">room.leave</td><td className="px-4 py-2 font-mono text-xs">roomCode, participantId</td></tr>
          <tr><td className="px-4 py-2 font-mono">slide.forward</td><td className="px-4 py-2 font-mono text-xs">roomCode, participantId</td></tr>
          <tr><td className="px-4 py-2 font-mono">slide.back</td><td className="px-4 py-2 font-mono text-xs">roomCode, participantId</td></tr>
          <tr><td className="px-4 py-2 font-mono">streams.layout.update</td><td className="px-4 py-2 font-mono text-xs">roomCode, participantId, visibleSlots[], auxLabels?</td></tr>
          <tr><td className="px-4 py-2 font-mono">publisher.active.update</td><td className="px-4 py-2 font-mono text-xs">roomCode, participantId, activePublisherId</td></tr>
          <tr><td className="px-4 py-2 font-mono">publisher.kick</td><td className="px-4 py-2 font-mono text-xs">roomCode, participantId, targetPublisherId</td></tr>
          <tr><td className="px-4 py-2 font-mono">media.token</td><td className="px-4 py-2 font-mono text-xs">roomCode, participantId, role; responds with token and url</td></tr>
        </tbody>
      </WikiTable>

      <WikiH3 id="server-emits">Server → client events</WikiH3>
      <WikiTable>
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className="px-4 py-2 font-medium">Event</th>
            <th className="px-4 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm">
          <tr><td className="px-4 py-2 font-mono">room.state</td><td className="px-4 py-2">Room metadata + participant list</td></tr>
          <tr><td className="px-4 py-2 font-mono">streams.layout.state</td><td className="px-4 py-2">Visible slots and aux labels for active publisher</td></tr>
          <tr><td className="px-4 py-2 font-mono">publisher.active.state</td><td className="px-4 py-2">Active publisher id + publisher list</td></tr>
          <tr><td className="px-4 py-2 font-mono">slide.forward / slide.back</td><td className="px-4 py-2">Relayed to desktop (active publisher handles)</td></tr>
          <tr><td className="px-4 py-2 font-mono">slide.state</td><td className="px-4 py-2">Slide index update broadcast</td></tr>
          <tr><td className="px-4 py-2 font-mono">publisher.kicked</td><td className="px-4 py-2">Sent to removed presenter</td></tr>
          <tr><td className="px-4 py-2 font-mono">error</td><td className="px-4 py-2">{`{ code, message }`}</td></tr>
        </tbody>
      </WikiTable>
    </WikiArticle>
  );
}

function ErrorsSection() {
  return (
    <WikiArticle>
      <WikiH2 id="errors">Error codes</WikiH2>
      <WikiTable>
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className="px-4 py-2 font-medium">Code</th>
            <th className="px-4 py-2 font-medium">HTTP</th>
            <th className="px-4 py-2 font-medium">Meaning</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm">
          <tr><td className="px-4 py-2 font-mono">ROOM_NOT_FOUND</td><td className="px-4 py-2">404</td><td className="px-4 py-2">Invalid or expired room code</td></tr>
          <tr><td className="px-4 py-2 font-mono">ROOM_CODE_TAKEN</td><td className="px-4 py-2">409</td><td className="px-4 py-2">Custom code already in use</td></tr>
          <tr><td className="px-4 py-2 font-mono">INVALID_ROOM_CODE</td><td className="px-4 py-2">400</td><td className="px-4 py-2">Malformed room code format</td></tr>
          <tr><td className="px-4 py-2 font-mono">ROOM_PASSWORD_REQUIRED</td><td className="px-4 py-2">401</td><td className="px-4 py-2">Room is password protected</td></tr>
          <tr><td className="px-4 py-2 font-mono">INVALID_ROOM_PASSWORD</td><td className="px-4 py-2">401</td><td className="px-4 py-2">Wrong password</td></tr>
          <tr><td className="px-4 py-2 font-mono">FORBIDDEN</td><td className="px-4 py-2">403</td><td className="px-4 py-2">Action not allowed for this participant</td></tr>
          <tr><td className="px-4 py-2 font-mono">NOT_FOUND</td><td className="px-4 py-2">404</td><td className="px-4 py-2">Target resource missing (e.g. publisher to kick)</td></tr>
          <tr><td className="px-4 py-2 font-mono">INTERNAL_ERROR</td><td className="px-4 py-2">500</td><td className="px-4 py-2">Unexpected server error</td></tr>
        </tbody>
      </WikiTable>
    </WikiArticle>
  );
}
