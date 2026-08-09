import type { Alpine } from 'alpinejs';

/** Shape of the event data serialized into the listing page for client-side filtering. */
export interface EventListItem {
  title: string;
  url: string;
  location: string;
  tags: string[];
  dateISO: string;
  dateFormatted: string;
}

export default (Alpine: Alpine): void => {
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
