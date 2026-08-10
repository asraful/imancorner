export const languageCodes = ['en', 'ar', 'fi'] as const;

export type Language = (typeof languageCodes)[number];

export const defaultLanguage: Language = 'en';

/** Native display name of each language, used in the language switcher. */
export const languages: Record<Language, string> = {
  en: 'English',
  ar: 'العربية',
  fi: 'Suomi',
};

export function dirFor(lang: Language): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

const ui = {
  en: {
    'site.name': 'Iman Corner',
    'site.tagline': 'Community events and programs.',
    'nav.events': 'Events',
    'langSwitcher.label': 'Language',
    'skipLink': 'Skip to content',
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
    'event.video': 'Event video',
    'event.backToEvents': 'All events',
  },
  ar: {
    'site.name': 'ركن الإيمان',
    'site.tagline': 'فعاليات وبرامج المجتمع.',
    'nav.events': 'الفعاليات',
    'langSwitcher.label': 'اللغة',
    'skipLink': 'تخطي إلى المحتوى',
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
    'event.video': 'فيديو الفعالية',
    'event.backToEvents': 'جميع الفعاليات',
  },
  fi: {
    'site.name': 'Iman Corner',
    'site.tagline': 'Yhteisön tapahtumat ja ohjelmat.',
    'nav.events': 'Tapahtumat',
    'langSwitcher.label': 'Kieli',
    'skipLink': 'Siirry sisältöön',
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
    'event.video': 'Tapahtuman video',
    'event.backToEvents': 'Kaikki tapahtumat',
  },
} as const satisfies Record<Language, Record<string, string>>;

export type UiKey = keyof (typeof ui)[typeof defaultLanguage];

export function t(lang: Language, key: UiKey): string {
  return ui[lang][key];
}

export function formatDate(date: Date, lang: Language): string {
  return new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(date);
}

/** Path of a page in another language, e.g. eventPath('ar', 'my-event') → /ar/events/my-event/ */
export function eventPath(lang: Language, translationKey: string): string {
  return `/${lang}/events/${translationKey}/`;
}

/** Path of a standalone page, e.g. pagePath('fi', 'about') → /fi/about/ */
export function pagePath(lang: Language, translationKey: string): string {
  return `/${lang}/${translationKey}/`;
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
