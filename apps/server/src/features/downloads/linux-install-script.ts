export const LINUX_INSTALL_DEB_NAME = 'Tandem-linux-amd64.deb';

export function buildLinuxInstallScript(debDownloadUrl: string): string {
  const escapedUrl = debDownloadUrl.replace(/'/g, "'\\''");

  return `#!/usr/bin/env bash
set -euo pipefail

if ! command -v apt-get >/dev/null 2>&1; then
  echo "Tandem requires apt (Ubuntu 22.04+ or Debian 12+)." >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required." >&2
  exit 1
fi

DEB_NAME="${LINUX_INSTALL_DEB_NAME}"
TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

curl -fsSL -o "$TMP/$DEB_NAME" '${escapedUrl}'

if [ "$(id -u)" -ne 0 ]; then
  exec sudo apt install -y "$TMP/$DEB_NAME"
fi

apt install -y "$TMP/$DEB_NAME"
`;
}
