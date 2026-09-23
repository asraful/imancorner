import type { CollectionEntry } from 'astro:content';
import { isoDay, siteTimeZone } from './site';

type EventData = CollectionEntry<'events'>['data'];

/** UTC offset of the site's time zone on a given day, e.g. "+03:00". */
function offsetOn(day: string): string {
  // Noon avoids landing inside a DST switch hour.
  const name = new Intl.DateTimeFormat('en-US', {
    timeZone: siteTimeZone,
    timeZoneName: 'longOffset',
  })
    .formatToParts(new Date(`${day}T12:00:00Z`))
    .find((part) => part.type === 'timeZoneName')?.value;

  const offset = name?.replace('GMT', '') ?? '';
  return offset === '' ? '+00:00' : offset;
}

/**
 * Start and end of an event as ISO 8601 strings. With a start time they are
 * full date-times in the site's time zone ("2026-09-05T14:00:00+03:00");
 * without one they are plain dates, i.e. an all-day event.
 */
export function eventSchedule(data: EventData): {
  start: string;
  end: string;
  allDay: boolean;
} {
  const startDay = isoDay(data.eventDate);
  const endDay = isoDay(data.endDate ?? data.eventDate);

  if (!data.startTime) {
    return { start: startDay, end: endDay, allDay: true };
  }

  const endTime = data.endTime ?? data.startTime;
  return {
    start: `${startDay}T${data.startTime}:00${offsetOn(startDay)}`,
    end: `${endDay}T${endTime}:00${offsetOn(endDay)}`,
    allDay: false,
  };
}

/** Maps link for an event: the editor's own link, else a search for the address. */
export function eventMapUrl(data: EventData): string | undefined {
  if (data.mapUrl) return data.mapUrl;
  const query = data.address || '';
  return query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    : undefined;
}

function icsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/([,;])/g, '\\$1');
}

/** Folds lines longer than 75 octets, as RFC 5545 requires. */
function icsFold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;

  const parts: string[] = [];
  let current = '';
  for (const char of line) {
    const limit = parts.length === 0 ? 75 : 74;
    if (new TextEncoder().encode(current + char).length > limit) {
      parts.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.join('\r\n ');
}

function icsDate(day: string): string {
  return day.replace(/-/g, '');
}

function icsUtc(isoDateTime: string): string {
  return new Date(isoDateTime).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function nextDay(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

/** A single-event iCalendar file. */
export function eventIcs(options: {
  uid: string;
  url: string;
  title: string;
  description: string;
  data: EventData;
}): string {
  const { uid, url, title, description, data } = options;
  const schedule = eventSchedule(data);
  const location = [data.location, data.address].filter(Boolean).join(', ');

  const timing = schedule.allDay
    ? [
        `DTSTART;VALUE=DATE:${icsDate(schedule.start)}`,
        // DTEND is exclusive for all-day events
        `DTEND;VALUE=DATE:${icsDate(nextDay(schedule.end))}`,
      ]
    : [`DTSTART:${icsUtc(schedule.start)}`, `DTEND:${icsUtc(schedule.end)}`];

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Iman Corner//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${icsUtc(new Date().toISOString())}`,
    ...timing,
    `SUMMARY:${icsText(title)}`,
    description && `DESCRIPTION:${icsText(`${description}\n\n${url}`)}`,
    location && `LOCATION:${icsText(location)}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean) as string[];

  return lines.map(icsFold).join('\r\n') + '\r\n';
}
