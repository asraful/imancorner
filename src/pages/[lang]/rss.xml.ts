import rss from '@astrojs/rss';
import type { APIRoute, GetStaticPaths } from 'astro';
import {
  articlePath,
  entryKey,
  eventPath,
  formatDate,
  languageCodes,
  t,
  type Language,
} from '../../i18n';
import {
  getArticles,
  getSettings,
  getUpcomingEvents,
} from '../../lib/site';

/** Feed of articles and upcoming events per language: /<lang>/rss.xml */
export const getStaticPaths = (() =>
  languageCodes.map((lang) => ({ params: { lang } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params, site }) => {
  const lang = params.lang as Language;
  const { data: settings } = await getSettings(lang);
  const siteName = settings.siteName || t(lang, 'site.name');

  const articles = (await getArticles(lang)).map((article) => ({
    title: article.data.title,
    link: articlePath(lang, entryKey(article.id)),
    description: article.data.excerpt,
    pubDate: article.data.publishDate,
    categories: [t(lang, 'articles.heading')],
  }));

  // Events are dated by when they happen, so upcoming ones sort to the top.
  const events = (await getUpcomingEvents(lang)).map((event) => ({
    title: event.data.title,
    link: eventPath(lang, entryKey(event.id)),
    description: [
      formatDate(event.data.eventDate, lang),
      event.data.time,
      event.data.location,
    ]
      .filter(Boolean)
      .join(' · '),
    pubDate: event.data.eventDate,
    categories: [t(lang, 'events.heading')],
  }));

  return rss({
    title: `${siteName} — ${t(lang, 'feed.title')}`,
    description: settings.tagline || t(lang, 'site.tagline'),
    site: new URL(`/${lang}/`, site),
    items: [...events, ...articles].sort(
      (a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0),
    ),
    customData: `<language>${lang}</language>`,
  });
};
