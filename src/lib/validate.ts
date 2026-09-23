import { getCollection } from 'astro:content';
import { entryKey } from '../i18n';

/** Page slugs taken by built-in routes under /<lang>/. */
export const reservedPageSlugs = new Set(['events', 'articles', 'series', 'topics']);

let checked: Promise<void> | undefined;

/**
 * Content mistakes an editor can make in the CMS that would otherwise
 * publish silently broken pages. Throwing here fails the build, so the
 * deploy stops and the live site keeps its last good version; the error
 * names the file to fix.
 */
export function assertContentIntegrity(): Promise<void> {
  checked ??= run();
  return checked;
}

async function run(): Promise<void> {
  const problems: string[] = [];

  const topicKeys = new Set(
    (await getCollection('topics')).map((topic) => entryKey(topic.id)),
  );
  for (const article of await getCollection('articles')) {
    const { topic } = article.data;
    if (topic && !topicKeys.has(topic)) {
      problems.push(
        `src/content/articles/${article.id}.md: topic "${topic}" does not exist ` +
          `(known topics: ${[...topicKeys].join(', ')}).`,
      );
    }
  }

  for (const page of await getCollection('pages')) {
    if (reservedPageSlugs.has(entryKey(page.id))) {
      problems.push(
        `src/content/pages/${page.id}.md: the slug "${entryKey(page.id)}" is ` +
          `reserved for a built-in section. Rename the page.`,
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(`Content problems found:\n- ${problems.join('\n- ')}`);
  }
}
