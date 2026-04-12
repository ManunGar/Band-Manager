const fs = require('fs');
const path = require('path');

const DOWNLOADS_DIR = path.resolve(__dirname, '../public/downloads');
const MANIFEST_PATH = path.resolve(DOWNLOADS_DIR, 'downloads-manifest.json');

const apkVersionRegex = /^.*?v(\d+)\.(\d+)\.(\d+)(?:[-._]?([0-9A-Za-z.-]+))?\.apk$/i;

function parseVersion(fileName) {
  const match = fileName.match(apkVersionRegex);
  if (!match) return null;

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    preRelease: match[4] || null,
    raw: `${match[1]}.${match[2]}.${match[3]}${match[4] ? `-${match[4]}` : ''}`,
  };
}

function compareVersions(a, b) {
  if (a.major !== b.major) return b.major - a.major;
  if (a.minor !== b.minor) return b.minor - a.minor;
  if (a.patch !== b.patch) return b.patch - a.patch;

  if (a.preRelease && !b.preRelease) return 1;
  if (!a.preRelease && b.preRelease) return -1;
  if (a.preRelease && b.preRelease) return a.preRelease.localeCompare(b.preRelease);

  return 0;
}

function buildManifest() {
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(DOWNLOADS_DIR)
    .filter((name) => name.toLowerCase().endsWith('.apk'))
    .map((name) => {
      const fullPath = path.resolve(DOWNLOADS_DIR, name);
      const stats = fs.statSync(fullPath);
      const version = parseVersion(name);

      return {
        name,
        href: `/downloads/${encodeURIComponent(name)}`,
        mtimeMs: stats.mtimeMs,
        version,
      };
    })
    .sort((left, right) => {
      if (left.version && right.version) {
        const versionComparison = compareVersions(left.version, right.version);
        if (versionComparison !== 0) return versionComparison;
      } else if (left.version && !right.version) {
        return -1;
      } else if (!left.version && right.version) {
        return 1;
      }

      return right.mtimeMs - left.mtimeMs;
    });

  const latest = files[0] || null;

  const manifest = {
    generatedAt: new Date().toISOString(),
    latestFileName: latest ? latest.name : null,
    latestHref: latest ? latest.href : null,
    files: files.map((file) => ({
      name: file.name,
      href: file.href,
      version: file.version ? file.version.raw : null,
      mtimeMs: file.mtimeMs,
    })),
  };

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  if (latest) {
    console.log(`[downloads] Latest APK: ${latest.name}`);
  } else {
    console.log('[downloads] No APK files found in public/downloads');
  }
}

buildManifest();
