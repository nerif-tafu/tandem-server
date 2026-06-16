export type DesktopPlatform = 'windows' | 'macos' | 'linux';

export interface DesktopDownload {
  platform: DesktopPlatform;
  label: string;
  fileName: string;
  downloadUrl: string;
  sizeBytes: number | null;
}

export interface DesktopReleaseInfo {
  version: string;
  tagName: string;
  publishedAt: string;
  releasePageUrl: string;
  downloads: DesktopDownload[];
}

interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface GitHubRelease {
  tag_name: string;
  published_at: string;
  html_url: string;
  assets: GitHubReleaseAsset[];
}

const PLATFORM_PATTERNS: Record<DesktopPlatform, RegExp[]> = {
  windows: [/\.msi$/i, /\.exe$/i],
  macos: [/\.dmg$/i],
  linux: [/\.AppImage$/i, /\.deb$/i],
};

const PLATFORM_LABELS: Record<DesktopPlatform, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
};

export async function fetchLatestDesktopRelease(repo: string): Promise<DesktopReleaseInfo | null> {
  const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'tandem-server',
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`GitHub releases API returned ${response.status}`);
  }

  const release = (await response.json()) as GitHubRelease;
  const downloads: DesktopDownload[] = [];

  for (const platform of Object.keys(PLATFORM_PATTERNS) as DesktopPlatform[]) {
    const asset = pickAsset(release.assets, platform);
    if (!asset) {
      continue;
    }

    downloads.push({
      platform,
      label: PLATFORM_LABELS[platform],
      fileName: asset.name,
      downloadUrl: asset.browser_download_url,
      sizeBytes: asset.size ?? null,
    });
  }

  return {
    version: release.tag_name.replace(/^v/, ''),
    tagName: release.tag_name,
    publishedAt: release.published_at,
    releasePageUrl: release.html_url,
    downloads,
  };
}

function pickAsset(assets: GitHubReleaseAsset[], platform: DesktopPlatform): GitHubReleaseAsset | null {
  for (const pattern of PLATFORM_PATTERNS[platform]) {
    const match = assets.find((asset) => pattern.test(asset.name));
    if (match) {
      return match;
    }
  }

  return null;
}
