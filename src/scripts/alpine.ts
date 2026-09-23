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

/** One lesson as serialized into the series page for the player. */
export interface PlaylistLesson {
  id: string;
  embed: string;
  title: string;
  meta: string;
}

export default (Alpine: Alpine): void => {
  // Series page player: the lesson list links to YouTube, and with
  // JavaScript a click plays the lesson in the embedded player instead.
  // ?v=<video id> opens the page on that lesson (used by the home page).
  Alpine.data('videoPlaylist', () => ({
    current: 0,
    src: '',
    lessons: [] as PlaylistLesson[],

    init() {
      const root = this.$el as HTMLElement;
      this.lessons = JSON.parse(root.dataset.lessons ?? '[]') as PlaylistLesson[];

      const requested = new URLSearchParams(location.search).get('v');
      const index = requested ? this.lessons.findIndex((l) => l.id === requested) : -1;
      if (index > 0) this.current = index;
      this.src = this.lessons[this.current]?.embed ?? '';

      if (index > 0) this.$nextTick(() => this.revealInList(index));
    },

    get lesson(): PlaylistLesson | undefined {
      return this.lessons[this.current];
    },

    play(index: number) {
      const lesson = this.lessons[index];
      if (!lesson) return;
      this.current = index;
      this.src = `${lesson.embed}${lesson.embed.includes('?') ? '&' : '?'}autoplay=1`;

      const url = new URL(location.href);
      url.searchParams.set('v', lesson.id);
      history.replaceState(null, '', url);

      // On small screens the list sits below the player; bring it back.
      const player = this.$refs.player as HTMLElement | undefined;
      if (player && player.getBoundingClientRect().top < 0) {
        player.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },

    next() {
      this.play(Math.min(this.current + 1, this.lessons.length - 1));
    },

    /** Scrolls the lesson list (not the page) to show one item. */
    revealInList(index: number) {
      const list = this.$refs.list as HTMLElement | undefined;
      const item = list?.querySelector<HTMLElement>(`[data-index="${index}"]`);
      if (list && item) list.scrollTop = item.offsetTop - list.offsetTop - 8;
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
