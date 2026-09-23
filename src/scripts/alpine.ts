import type { Alpine } from 'alpinejs';

/** Shape of the event data serialized into the listing page for client-side filtering. */
export interface EventListItem {
  title: string;
  url: string;
  location: string;
  category: string;
  time: string;
  tags: string[];
  dateISO: string;
  dateFormatted: string;
  /** Date and time joined for display, e.g. "15 August 2026 · After Maghrib". */
  when: string;
}

export default (Alpine: Alpine): void => {
  // Series page player: the lesson list links to YouTube, and with
  // JavaScript a click plays the lesson in the embedded player instead.
  Alpine.data('videoPlaylist', () => ({
    current: 0,
    src: '',

    init() {
      this.src = (this.$el as HTMLElement).dataset.first ?? '';
    },

    play(index: number, embedUrl: string) {
      this.current = index;
      this.src = `${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`;
      (this.$refs.player as HTMLElement | undefined)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    },
  }));

  Alpine.data('eventList', () => ({
    search: '',
    activeTag: '',
    events: [] as EventListItem[],

    init() {
      const json = document.getElementById('event-data')?.textContent;
      this.events = json ? (JSON.parse(json) as EventListItem[]) : [];
    },

    get filteredEvents(): EventListItem[] {
      const query = this.search.trim().toLocaleLowerCase();
      return this.events.filter((event) => {
        const matchesSearch =
          !query ||
          event.title.toLocaleLowerCase().includes(query) ||
          event.location.toLocaleLowerCase().includes(query);
        const matchesTag = !this.activeTag || event.tags.includes(this.activeTag);
        return matchesSearch && matchesTag;
      });
    },

    get hasFilters(): boolean {
      return this.search.trim() !== '' || this.activeTag !== '';
    },

    toggleTag(tag: string) {
      this.activeTag = this.activeTag === tag ? '' : tag;
    },

    reset() {
      this.search = '';
      this.activeTag = '';
    },
  }));
};
