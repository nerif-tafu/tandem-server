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
        Tandem is a remote presenter assist tool for live events. A presenter runs the desktop app
        to capture and publish video feeds (main deck, presenter notes, optional auxiliary sources).
        Co-presenters and operators join from the web to watch those feeds and control slides
        remotely.
      </WikiP>
      <WikiP>
        The system has three main parts: the <strong className="text-foreground">desktop publisher</strong>{' '}
        (Tauri), the <strong className="text-foreground">web viewer</strong> (this site), and the{' '}
        <strong className="text-foreground">Tandem server</strong> (HTTP + Socket.IO + LiveKit for
        WebRTC media).
      </WikiP>
      <WikiH3 id="components">Components</WikiH3>
      <WikiUl>
        <li>
          <strong className="text-foreground">Desktop app</strong> — creates rooms, captures screen /
          webcam / NDI, publishes tracks, switches the live presenter, routes clicker input to a
          presentation window.
        </li>
        <li>
          <strong className="text-foreground">Web app</strong> — joins rooms as a viewer, watches
          LiveKit streams, sends slide commands, adjusts stream quality.
        </li>
        <li>
          <strong className="text-foreground">Server</strong> — room lifecycle, real-time state over
          sockets, LiveKit token issuance, optional static hosting of the web build.
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
      <WikiH3 id="prerequisites">Prerequisites</WikiH3>
      <WikiUl>
        <li>Tandem server running (default dev: port 3841)</li>
        <li>LiveKit server reachable by clients (bundled in dev)</li>
        <li>Desktop app for publishing; web browser for viewing</li>
      </WikiUl>
      <WikiH3 id="quick-start">Quick start</WikiH3>
      <WikiOl>
        <li>Start the server: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">pnpm dev:server</code></li>
        <li>Start the desktop app: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">pnpm dev:client</code></li>
        <li>Create a room in the desktop app and note the 5-character room code</li>
        <li>Assign capture sources (screen, webcam, or NDI) to each slot you need</li>
        <li>Open this website, go to <strong className="text-foreground">Join room</strong>, enter the code and your name</li>
        <li>Use the remote clicker or arrow keys to advance slides on the presenter machine</li>
      </WikiOl>
      <WikiH3 id="invite-link">Invite link</WikiH3>
      <WikiP>
        From the desktop app, use <strong className="text-foreground">Share</strong> to copy a web
        URL. Room links use the format{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">/room/ABCDE?name=Alex</code>.
        Opening that URL pre-fills the join form.
      </WikiP>
    </WikiArticle>
  );
}

function DesktopSection() {
  return (
    <WikiArticle>
      <WikiH2 id="desktop">Desktop app</WikiH2>
      <WikiP>
        The desktop app is the publisher. Each installation that joins a room becomes a presenter
        with its own capture layout and optional clicker target window.
      </WikiP>
      <WikiH3 id="capture-sources">Capture sources</WikiH3>
      <WikiUl>
        <li><strong className="text-foreground">Screen</strong> — full display capture via Windows Graphics Capture</li>
        <li><strong className="text-foreground">Webcam</strong> — browser media capture in the desktop WebView</li>
        <li><strong className="text-foreground">NDI</strong> — network video inputs (when built with NDI support)</li>
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
        When multiple desktop presenters are in a room, any presenter can choose which presenter&apos;s
        feeds are shown to web viewers. Kicking another presenter removes them from the room.
      </WikiP>
      <WikiH3 id="clicker-target">Clicker target</WikiH3>
      <WikiP>
        Select which open presentation window receives slide-forward and slide-back commands from
        the web remote clicker. Only the active publisher&apos;s machine processes slide commands.
      </WikiP>
    </WikiArticle>
  );
}

function WebViewerSection() {
  return (
    <WikiArticle>
      <WikiH2 id="web-viewer">Web viewer</WikiH2>
      <WikiP>
        The web app joins rooms as <code className="rounded bg-muted px-1 font-mono text-sm">clientType: web</code>{' '}
        with role <code className="rounded bg-muted px-1 font-mono text-sm">viewer</code>. After joining,
        you see video feeds for the active presenter&apos;s visible slots.
      </WikiP>
      <WikiH3 id="session-header">Session header</WikiH3>
      <WikiUl>
        <li>Room code — click to copy</li>
        <li>Joined as — your display name</li>
        <li>Stream quality — applies to all feeds (480p / 720p / 1080p simulcast layer)</li>
        <li>Fullscreen and leave room</li>
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
        Rooms use a 5-character code from charset A–Z and 2–9 (excluding ambiguous characters).
        Rooms expire after a configurable TTL (default 8 hours). An optional password can be set at
        creation.
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
        Each desktop join creates a new publisher (e.g. Presenter 1, Presenter 2). One publisher is
        designated <strong className="text-foreground">active</strong> at a time; web viewers only
        subscribe to that publisher&apos;s LiveKit tracks.
      </WikiP>
    </WikiArticle>
  );
}

function StreamingSection() {
  return (
    <WikiArticle>
      <WikiH2 id="streaming">Streaming</WikiH2>
      <WikiP>
        Video is delivered over WebRTC using LiveKit. The desktop app publishes one video track per
        active slot, named by slot id (<code className="font-mono text-sm">main</code>,{' '}
        <code className="font-mono text-sm">notes</code>, etc.). Publishers use simulcast with 480p
        and 720p layers plus a 1080p cap.
      </WikiP>
      <WikiH3 id="layout-sync">Layout sync</WikiH3>
      <WikiP>
        The desktop app broadcasts which slots are visible and auxiliary labels over Socket.IO. When
        the active publisher changes, viewers receive the new publisher&apos;s layout and track set.
      </WikiP>
      <WikiH3 id="media-token">Media tokens</WikiH3>
      <WikiP>
        Clients obtain a LiveKit JWT via{' '}
        <code className="font-mono text-sm">POST /api/rooms/:code/media-token</code> or the socket{' '}
        <code className="font-mono text-sm">media.token</code> event (desktop). Tokens are scoped to
        room code and participant id.
      </WikiP>
    </WikiArticle>
  );
}

function RemoteClickerSection() {
  return (
    <WikiArticle>
      <WikiH2 id="remote-clicker">Remote clicker</WikiH2>
      <WikiP>
        Web viewers send slide commands over Socket.IO. The server relays{' '}
        <code className="font-mono text-sm">slide.forward</code> and{' '}
        <code className="font-mono text-sm">slide.back</code> to desktop clients in the room. Only
        the machine whose participant is the active publisher acts on commands (forwards to the
        native presentation target).
      </WikiP>
      <WikiCode>{`// Web client emit
socket.emit('slide.forward', { roomCode, participantId });
socket.emit('slide.back', { roomCode, participantId });`}</WikiCode>
    </WikiArticle>
  );
}

function ApiRestSection() {
  return (
    <WikiArticle>
      <WikiH2 id="api-rest">REST API</WikiH2>
      <WikiP>
        Base URL is the Tandem server (e.g. <code className="font-mono text-sm">http://127.0.0.1:3841</code>{' '}
        in development). All JSON bodies use <code className="font-mono text-sm">Content-Type: application/json</code>.
        Errors return <code className="font-mono text-sm">{`{ "error": { "code", "message" } }`}</code>.
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

403 FORBIDDEN — not a publisher or kicking self
404 NOT_FOUND — target not found`}</WikiCode>
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
          <tr><td className="px-4 py-2 font-mono">media.token</td><td className="px-4 py-2 font-mono text-xs">roomCode, participantId, role — callback(token, url)</td></tr>
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
