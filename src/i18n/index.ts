export const languageCodes = ['en', 'ar', 'fi'] as const;

export type Language = (typeof languageCodes)[number];

export const defaultLanguage: Language = 'en';

/** Native display name of each language, used in the language switcher. */
export const languages: Record<Language, string> = {
  en: 'English',
  ar: 'العربية',
  fi: 'Suomi',
};

/** Short code shown in the compact (header) language switcher. */
export const languageShortLabels: Record<Language, string> = {
  en: 'EN',
  ar: 'ع',
  fi: 'FI',
};

export function dirFor(lang: Language): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

const ui = {
  en: {
    'site.name': 'Iman Corner',
    'site.tagline': 'Community events and programs.',
    'nav.events': 'Events',
    'nav.menu': 'Menu',
    'langSwitcher.label': 'Language',
    skipLink: 'Skip to content',
    'events.heading': 'Events',
    'events.searchLabel': 'Search events',
    'events.searchPlaceholder': 'Search by title or location…',
    'events.filterByTag': 'Filter by tag',
    'events.reset': 'Clear filters',
    'events.noResults': 'No events match your search.',
    'events.none': 'No events published yet.',
    'events.viewAll': 'View all events',
    'event.date': 'Date',
    'event.location': 'Location',
    'event.time': 'Time',
    'event.video': 'Event video',
    'event.backToEvents': 'All events',
    'event.details': 'Event details',
    'articles.heading': 'Articles',
    'articles.none': 'No articles published yet.',
    'articles.viewAll': 'All articles',
    'articles.read': 'Read article',
    'articles.minutes': 'min',
    'articles.backToArticles': 'All articles',
    'articles.inTopic': 'Articles in this topic',
    'series.heading': 'Study series',
    'series.none': 'No series published yet.',
    'series.viewAll': 'All series',
    'series.backToSeries': 'All series',
    'series.open': 'Open series',
    'topics.heading': 'Topics',
    'topics.explore': 'Explore topic',
    'newsletter.emailLabel': 'Email address',
    'notFound.title': 'Page not found',
    'notFound.body': 'The page you were looking for does not exist or may have moved.',
    'notFound.home': 'Go to the homepage',
  },
  ar: {
    'site.name': 'ركن الإيمان',
    'site.tagline': 'فعاليات وبرامج المجتمع.',
    'nav.events': 'الفعاليات',
    'nav.menu': 'القائمة',
    'langSwitcher.label': 'اللغة',
    skipLink: 'تخطي إلى المحتوى',
    'events.heading': 'الفعاليات',
    'events.searchLabel': 'ابحث في الفعاليات',
    'events.searchPlaceholder': 'ابحث بالعنوان أو الموقع…',
    'events.filterByTag': 'تصفية حسب الوسم',
    'events.reset': 'مسح عوامل التصفية',
    'events.noResults': 'لا توجد فعاليات مطابقة لبحثك.',
    'events.none': 'لا توجد فعاليات منشورة بعد.',
    'events.viewAll': 'عرض جميع الفعاليات',
    'event.date': 'التاريخ',
    'event.location': 'الموقع',
    'event.time': 'الوقت',
    'event.video': 'فيديو الفعالية',
    'event.backToEvents': 'جميع الفعاليات',
    'event.details': 'تفاصيل الفعالية',
    'articles.heading': 'المقالات',
    'articles.none': 'لا توجد مقالات منشورة بعد.',
    'articles.viewAll': 'جميع المقالات',
    'articles.read': 'اقرأ المقال',
    'articles.minutes': 'دقيقة',
    'articles.backToArticles': 'جميع المقالات',
    'articles.inTopic': 'مقالات في هذا الباب',
    'series.heading': 'السلاسل الدراسية',
    'series.none': 'لا توجد سلاسل منشورة بعد.',
    'series.viewAll': 'جميع السلاسل',
    'series.backToSeries': 'جميع السلاسل',
    'series.open': 'افتح السلسلة',
    'topics.heading': 'الأبواب',
    'topics.explore': 'استكشف الباب',
    'newsletter.emailLabel': 'البريد الإلكتروني',
    'notFound.title': 'الصفحة غير موجودة',
    'notFound.body': 'الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.',
    'notFound.home': 'الذهاب إلى الصفحة الرئيسية',
  },
  fi: {
    'site.name': 'Iman Corner',
    'site.tagline': 'Yhteisön tapahtumat ja ohjelmat.',
    'nav.events': 'Tapahtumat',
    'nav.menu': 'Valikko',
    'langSwitcher.label': 'Kieli',
    skipLink: 'Siirry sisältöön',
    'events.heading': 'Tapahtumat',
    'events.searchLabel': 'Hae tapahtumia',
    'events.searchPlaceholder': 'Hae otsikolla tai sijainnilla…',
    'events.filterByTag': 'Suodata tunnisteella',
    'events.reset': 'Tyhjennä suodattimet',
    'events.noResults': 'Hakuasi vastaavia tapahtumia ei löytynyt.',
    'events.none': 'Tapahtumia ei ole vielä julkaistu.',
    'events.viewAll': 'Näytä kaikki tapahtumat',
    'event.date': 'Päivämäärä',
    'event.location': 'Sijainti',
    'event.time': 'Kellonaika',
    'event.video': 'Tapahtuman video',
    'event.backToEvents': 'Kaikki tapahtumat',
    'event.details': 'Tapahtuman tiedot',
    'articles.heading': 'Artikkelit',
    'articles.none': 'Artikkeleita ei ole vielä julkaistu.',
    'articles.viewAll': 'Kaikki artikkelit',
    'articles.read': 'Lue artikkeli',
    'articles.minutes': 'min',
    'articles.backToArticles': 'Kaikki artikkelit',
    'articles.inTopic': 'Tämän aiheen artikkelit',
    'series.heading': 'Opintosarjat',
    'series.none': 'Sarjoja ei ole vielä julkaistu.',
    'series.viewAll': 'Kaikki sarjat',
    'series.backToSeries': 'Kaikki sarjat',
    'series.open': 'Avaa sarja',
    'topics.heading': 'Aiheet',
    'topics.explore': 'Tutustu aiheeseen',
    'newsletter.emailLabel': 'Sähköpostiosoite',
    'notFound.title': 'Sivua ei löytynyt',
    'notFound.body': 'Etsimääsi sivua ei ole olemassa tai se on siirretty.',
    'notFound.home': 'Siirry etusivulle',
  },
} as const satisfies Record<Language, Record<string, string>>;

export type UiKey = keyof (typeof ui)[typeof defaultLanguage];

export function t(lang: Language, key: UiKey): string {
  return ui[lang][key];
}

export function formatDate(date: Date, lang: Language): string {
  return new Intl.DateTimeFormat(lang, {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(date);
}

/** Path of a page in another language, e.g. eventPath('ar', 'my-event') → /ar/events/my-event/ */
export function eventPath(lang: Language, translationKey: string): string {
  return `/${lang}/events/${translationKey}/`;
}

/** Path of an article, e.g. articlePath('en', 'intention') → /en/articles/intention/ */
export function articlePath(lang: Language, translationKey: string): string {
  return `/${lang}/articles/${translationKey}/`;
}

/** Path of a study series, e.g. seriesPath('en', '40-hadith') → /en/series/40-hadith/ */
export function seriesPath(lang: Language, translationKey: string): string {
  return `/${lang}/series/${translationKey}/`;
}

/** Path of a topic hub, e.g. topicPath('en', 'quran') → /en/topics/quran/ */
export function topicPath(lang: Language, translationKey: string): string {
  return `/${lang}/topics/${translationKey}/`;
}

/** Path of a standalone page, e.g. pagePath('fi', 'about') → /fi/about/ */
export function pagePath(lang: Language, translationKey: string): string {
  return `/${lang}/${translationKey}/`;
}

/**
 * Turns a link written in the CMS into a real URL for the language being
 * rendered. Editors type site-relative paths without the language prefix
 * (`/events/`), so the same navigation entry works in all three languages;
 * external links (`https://…`), anchors (`#newsletter`) and mail/phone links
 * are left untouched.
 */
export function resolveUrl(lang: Language, url: string): string {
  const trimmed = url.trim();

  if (trimmed === '') return `/${lang}/`;
  if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(trimmed)) return trimmed;
  if (!trimmed.startsWith('/')) return `/${lang}/${trimmed}`;

  return `/${lang}${trimmed}`;
}

/**
 * Content entries live at src/content/<collection>/<language>/<key>.md, so an
 * entry's id (e.g. `en/my-event`) encodes both its language and its
 * translation key. Entries in different languages with the same key are
 * translations of one another.
 */
export function entryLanguage(id: string): Language {
  return id.split('/')[0] as Language;
}

export function entryKey(id: string): string {
  return id.split('/').slice(1).join('/');
}

/**
 * Whether an entry belongs on the site: every route, listing and menu filters
 * through this.
 *
 * Besides drafts, this excludes translations that exist as a file but have not
 * been written yet — creating an entry in the CMS saves all three languages at
 * once, so the languages the editor left blank land in the repo as frontmatter
 * with no title. Those are absent from their language until someone fills them
 * in; the other languages publish as usual.
 */
export function isPublished(data: { title: string; isDraft: boolean }): boolean {
  return !data.isDraft && data.title.trim() !== '';
}
