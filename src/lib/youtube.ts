const idPattern =
  /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?.*?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{11})/;

/** The 11-character video id of any YouTube link, or undefined. */
export function youtubeId(url: string): string | undefined {
  return url.match(idPattern)?.[1];
}

/**
 * YouTube only allows /embed/ URLs inside iframes (X-Frame-Options: sameorigin
 * on all other pages), but CMS editors will paste whatever is in their address
 * bar — watch, youtu.be, or shorts links. Normalize them all to the embed form.
 */
export function toEmbedUrl(url: string): string {
  const id = youtubeId(url);
  if (!id) return url;

  const start = url.match(/[?&](?:t|start)=(\d+)/)?.[1];
  return `https://www.youtube.com/embed/${id}${start ? `?start=${start}` : ''}`;
}

/** Thumbnail image of a video (480×360, always available). */
export function youtubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
