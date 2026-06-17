import { describe, expect, it } from 'vitest';

import { normalizeLiveKitUrl, resolveLiveKitUrlForClient } from './livekit-url.js';

describe('normalizeLiveKitUrl', () => {
  it('rewrites 127.0.0.1 to localhost for loopback hosts', () => {
    expect(normalizeLiveKitUrl('ws://127.0.0.1:7880')).toBe('ws://localhost:7880');
  });

  it('leaves non-loopback hosts unchanged', () => {
    expect(normalizeLiveKitUrl('wss://livekit.example.com')).toBe('wss://livekit.example.com');
  });
});

describe('resolveLiveKitUrlForClient', () => {
  it('uses LIVEKIT_PUBLIC_URL when set, ignoring client hostname', () => {
    expect(
      resolveLiveKitUrlForClient(
        'ws://livekit:7880',
        'app.example.com',
        'wss://livekit.example.com',
      ),
    ).toBe('wss://livekit.example.com');
  });

  it('coerces https public URL to wss', () => {
    expect(
      resolveLiveKitUrlForClient('ws://livekit:7880', 'app.example.com', 'https://livekit.example.com'),
    ).toBe('wss://livekit.example.com');
  });

  it('falls back to client hostname with port 7880 when public URL unset', () => {
    expect(resolveLiveKitUrlForClient('ws://localhost:7880', '192.168.1.10')).toBe(
      'ws://192.168.1.10:7880',
    );
  });

  it('uses wss when internal server URL is secure', () => {
    expect(resolveLiveKitUrlForClient('wss://livekit.internal:7880', 'app.example.com')).toBe(
      'wss://app.example.com:7880',
    );
  });

  it('normalizes server URL when no hostname or public URL', () => {
    expect(resolveLiveKitUrlForClient('ws://127.0.0.1:7880')).toBe('ws://localhost:7880');
  });

  it('coerces http server URL to ws when no hostname or public URL', () => {
    expect(resolveLiveKitUrlForClient('http://localhost:7880')).toBe('ws://localhost:7880');
  });
});
