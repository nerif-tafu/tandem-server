import { useEffect, useState } from 'react';

import { Card } from '../../components/ui';

interface DesktopDownload {
  platform: 'windows' | 'macos' | 'linux';
  label: string;
  fileName: string;
  downloadUrl: string;
  sizeBytes: number | null;
}

interface DesktopReleaseInfo {
  version: string;
  tagName: string;
  publishedAt: string;
  releasePageUrl: string;
  downloads: DesktopDownload[];
}

const PLATFORM_ORDER: DesktopDownload['platform'][] = ['windows', 'macos', 'linux'];

const PLATFORM_DESCRIPTIONS: Record<DesktopDownload['platform'], string> = {
  windows: 'Windows installer. Run the setup exe to install Tandem and the bundled NDI runtime.',
  macos: 'Disk image for Apple Silicon and Intel Macs.',
  linux: 'AppImage for most x86_64 distributions.',
};

function formatBytes(bytes: number | null): string | null {
  if (bytes === null || bytes <= 0) {
    return null;
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(iso));
}

export function DownloadPage() {
  const [release, setRelease] = useState<DesktopReleaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/downloads/desktop');
        if (!response.ok) {
          if (response.status === 404) {
            if (!cancelled) {
              setRelease(null);
            }
            return;
          }

          throw new Error(`Request failed (${response.status})`);
        }

        const data = (await response.json()) as { release: DesktopReleaseInfo };
        if (!cancelled) {
          setRelease(data.release);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load download links. Try again in a moment.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const downloads = PLATFORM_ORDER.map((platform) =>
    release?.downloads.find((item) => item.platform === platform),
  ).filter((item): item is DesktopDownload => Boolean(item));

  return (
    <main className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h1 className="font-display text-4xl md:text-5xl">Download Tandem</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Install the desktop publisher to capture sources, create rooms, and stream to remote
            viewers.
          </p>
          {release ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Latest release{' '}
              <span className="font-medium text-foreground">v{release.version}</span>
              {' · '}
              {formatDate(release.publishedAt)}
            </p>
          ) : null}
        </div>

        {loading ? (
          <p className="mt-12 text-center text-muted-foreground">Loading downloads…</p>
        ) : error ? (
          <Card className="mt-12 p-6 text-center text-sm text-destructive">{error}</Card>
        ) : downloads.length === 0 ? (
          <Card className="mt-12 p-8 text-center">
            <p className="text-muted-foreground">No desktop builds are published yet.</p>
            <a
              href="https://github.com/nerif-tafu/tandem-desktop/releases"
              className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              View releases on GitHub
            </a>
          </Card>
        ) : (
          <div className="mt-12 grid gap-4">
            {downloads.map((download) => (
              <Card key={download.platform} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{download.label}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {PLATFORM_DESCRIPTIONS[download.platform]}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {download.fileName}
                    {formatBytes(download.sizeBytes) ? ` · ${formatBytes(download.sizeBytes)}` : ''}
                  </p>
                </div>
                <a
                  href={download.downloadUrl}
                  className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-accent to-accent-secondary px-6 text-sm font-medium text-accent-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(0,82,255,0.25)]"
                >
                  Download
                </a>
              </Card>
            ))}
          </div>
        )}

        {release ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            <a
              href={release.releasePageUrl}
              className="font-medium text-accent hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              All releases on GitHub
            </a>
          </p>
        ) : null}
      </div>
    </main>
  );
}
