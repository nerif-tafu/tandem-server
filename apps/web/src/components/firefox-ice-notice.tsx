import { isFirefox, isLoopbackHost } from '../lib/livekit-url';

export function FirefoxIceNotice() {
  if (typeof window === 'undefined' || !isFirefox() || !isLoopbackHost(window.location.hostname)) {
    return null;
  }

  const lanHint =
    'Open this app using your computer’s LAN IP instead of localhost — e.g. http://192.168.1.10:5173 — and set LIVEKIT_NODE_IP to that same IP in docker/.env before restarting LiveKit.';

  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
      role="status"
    >
      <p className="font-medium">Firefox can’t use WebRTC on localhost</p>
      <p className="mt-1 text-amber-900">{lanHint}</p>
      <p className="mt-2 text-xs text-amber-800">
        Alternative: in <code className="font-mono">about:config</code>, set{' '}
        <code className="font-mono">media.peerconnection.ice.loopback</code> to{' '}
        <code className="font-mono">true</code> and restart Firefox.
      </p>
    </div>
  );
}
