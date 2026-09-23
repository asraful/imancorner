#!/usr/bin/env node
/**
 * Adds new videos from the YouTube channel to the study series on the site.
 *
 * Reads the channel's and each playlist's public RSS feed (no API key; each
 * feed lists its 15 most recent videos), and for every video that is not on
 * the site yet appends it to the series its playlist maps to in
 * youtube-sync.config.json — or to the fallback series when it is in no
 * mapped playlist yet. A video parked in the fallback series moves to its
 * real series once it shows up in a mapped playlist. Videos an editor has
 * placed anywhere else are left alone.
 *
 * Usage: node scripts/youtube-sync.mjs [--dry-run]
 * Writes src/content/series/<lang>/<slug>.md for every language that has
 * the series. Prints a summary (also to $GITHUB_STEP_SUMMARY) and sets the
 * `changed` output for the workflow.
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Scalar, parseDocument } from 'yaml';

const root = fileURLToPath(new URL('..', import.meta.url));
const config = JSON.parse(readFileSync(`${root}scripts/youtube-sync.config.json`, 'utf8'));
const languages = ['en', 'ar', 'fi'];
const dryRun = process.argv.includes('--dry-run');

const feedUrl = (query) => `https://www.youtube.com/feeds/videos.xml?${query}`;
const seriesFile = (lang, slug) => `${root}src/content/series/${lang}/${slug}.md`;
const idOf = (url) => url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)?.[1];

// ---------------------------------------------------------------- feeds

function decode(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

async function readFeed(query) {
  const response = await fetch(feedUrl(query));
  if (!response.ok) throw new Error(`${feedUrl(query)} answered ${response.status}`);
  const xml = await response.text();

  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, entry]) => {
    const tag = (name) => entry.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1] ?? '';
    return {
      id: tag('yt:videoId'),
      channelId: tag('yt:channelId'),
      title: decode(tag('title')).replace(/\s+/g, ' ').trim(),
      published: tag('published').slice(0, 10),
      link: entry.match(/<link rel="alternate" href="([^"]+)"/)?.[1] ?? '',
    };
  });
}

/** Length in minutes, and whether the video is a live stream that has not ended. */
async function videoDetails(id) {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${id}`, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'Mozilla/5.0' },
    });
    const html = await response.text();
    const seconds = Number(html.match(/"lengthSeconds":"(\d+)"/)?.[1] ?? 0);
    const pending = /"isUpcoming":true/.test(html) || /"isLiveNow":true/.test(html);
    return { minutes: seconds > 0 ? Math.max(1, Math.round(seconds / 60)) : 0, pending };
  } catch {
    // The length is optional on the site; never fail a sync over it.
    return { minutes: 0, pending: false };
  }
}

// ---------------------------------------------------------------- series files

function loadSeries(lang, slug) {
  const path = seriesFile(lang, slug);
  if (!existsSync(path)) return undefined;

  const text = readFileSync(path, 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`${path} has no frontmatter`);
  return { path, doc: parseDocument(match[1]), body: match[2], dirty: false };
}

const files = new Map(); // "<lang>/<slug>" -> loaded file
function series(lang, slug) {
  const key = `${lang}/${slug}`;
  if (!files.has(key)) files.set(key, loadSeries(lang, slug));
  return files.get(key);
}

function videosOf(file) {
  let list = file.doc.get('videos');
  if (!list) {
    file.doc.set('videos', file.doc.createNode([]));
    list = file.doc.get('videos');
  }
  return list;
}

function language(title) {
  const arabic = /[؀-ۿ]/.test(title);
  const latin = /[A-Za-z]/.test(title);
  return arabic && latin ? 'both' : arabic ? 'ar' : 'en';
}

function addVideo(slug, video) {
  for (const lang of languages) {
    const file = series(lang, slug);
    if (!file) continue;
    const title = new Scalar(video.title);
    title.type = Scalar.QUOTE_DOUBLE;
    videosOf(file).add(
      file.doc.createNode({
        title,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        date: video.published,
        minutes: video.minutes,
        language: language(video.title),
      }),
    );
    file.dirty = true;
  }
}

function removeVideo(slug, id) {
  for (const lang of languages) {
    const file = series(lang, slug);
    if (!file) continue;
    const list = videosOf(file);
    const index = list.items.findIndex((item) => idOf(String(item.get('url'))) === id);
    if (index >= 0) {
      list.delete(index);
      file.dirty = true;
    }
  }
}

/** Where every video already on the site lives: video id -> series slug. */
function placedVideos() {
  const slugs = new Set([...Object.values(config.playlists), config.fallbackSeries]);
  const placed = new Map();
  for (const slug of slugs) {
    const file = series('en', slug) ?? languages.map((l) => series(l, slug)).find(Boolean);
    if (!file) continue;
    for (const item of videosOf(file).items) {
      const id = idOf(String(item.get('url')));
      if (id) placed.set(id, slug);
    }
  }
  return placed;
}

// ---------------------------------------------------------------- sync

const log = [];
const note = (line) => {
  log.push(line);
  console.log(line);
};

const channelVideos = await readFeed(`channel_id=${config.channelId}`);

// Which mapped playlist each recent video is in.
const playlistOf = new Map();
const ignoredByPlaylist = new Set();
for (const playlistId of [...Object.keys(config.playlists), ...Object.keys(config.ignorePlaylists)]) {
  let entries;
  try {
    entries = await readFeed(`playlist_id=${playlistId}`);
  } catch (error) {
    note(`⚠️ Could not read playlist ${playlistId}: ${error.message}`);
    continue;
  }
  for (const entry of entries) {
    if (entry.channelId && !config.channelId.endsWith(entry.channelId.replace(/^UC/, ''))) continue;
    if (playlistId in config.ignorePlaylists) ignoredByPlaylist.add(entry.id);
    else if (!playlistOf.has(entry.id)) playlistOf.set(entry.id, { playlistId, entry });
  }
}

// Candidates: recent uploads, plus older videos that were just added to a playlist.
const candidates = new Map(channelVideos.map((video) => [video.id, video]));
for (const [id, { entry }] of playlistOf) if (!candidates.has(id)) candidates.set(id, entry);

const placed = placedVideos();
let changed = 0;

// Oldest first, so parts land in the order they were published.
for (const video of [...candidates.values()].sort((a, b) => a.published.localeCompare(b.published))) {
  if (video.id in config.ignoreVideos || ignoredByPlaylist.has(video.id)) continue;
  if (!config.includeShorts && video.link.includes('/shorts/')) continue;

  const target = config.playlists[playlistOf.get(video.id)?.playlistId] ?? config.fallbackSeries;
  const current = placed.get(video.id);
  if (current === target) continue;

  if (current && current !== config.fallbackSeries) {
    // Placed by an editor, or moved on purpose: their choice wins.
    continue;
  }
  if (!series('en', target) && !languages.some((lang) => series(lang, target))) {
    note(`⚠️ "${video.title}" maps to series "${target}", which has no file. Skipped.`);
    continue;
  }

  const details = await videoDetails(video.id);
  if (details.pending) {
    note(`⏳ "${video.title}" is an upcoming or ongoing live stream; will add it once it has ended.`);
    continue;
  }

  if (current === config.fallbackSeries) {
    removeVideo(current, video.id);
    note(`↪️ Moved "${video.title}" from ${current} to ${target}.`);
  } else {
    note(`➕ Added "${video.title}" (${video.published}) to ${target}.`);
  }
  addVideo(target, { ...video, minutes: details.minutes });
  placed.set(video.id, target);
  changed++;
}

if (!dryRun) {
  for (const file of files.values()) {
    if (!file?.dirty) continue;
    const frontmatter = file.doc.toString({ lineWidth: 0 });
    writeFileSync(file.path, `---\n${frontmatter}---\n${file.body ? `\n${file.body.replace(/^\n/, '')}` : ''}`);
  }
}

const summary = changed
  ? `YouTube sync: ${changed} video${changed === 1 ? '' : 's'} ${dryRun ? 'would be ' : ''}added or moved.`
  : 'YouTube sync: the site is up to date with the channel.';
console.log(summary);

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### ${summary}\n\n${log.map((line) => `- ${line}`).join('\n')}\n`,
  );
}
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed > 0 && !dryRun}\n`);
}
