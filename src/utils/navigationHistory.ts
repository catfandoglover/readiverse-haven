
const LAST_VISITED_KEY_PREFIX = 'last-visited-';
const SCROLL_POSITION_KEY_PREFIX = 'scroll-position-';

export const sections = {
  dna: '/',
  discover: '/discover',
  bookshelf: '/bookshelf',
  dashboard: '/dashboard'
} as const;

export const saveLastVisited = (section: keyof typeof sections, path: string) => {
  localStorage.setItem(`${LAST_VISITED_KEY_PREFIX}${section}`, path);
};

export const getLastVisited = (section: keyof typeof sections): string => {
  return localStorage.getItem(`${LAST_VISITED_KEY_PREFIX}${section}`) || sections[section];
};

export const clearLastVisited = (section: keyof typeof sections) => {
  localStorage.removeItem(`${LAST_VISITED_KEY_PREFIX}${section}`);
};

export const saveScrollPosition = (path: string, position: number) => {
  if (position > 0) {
    localStorage.setItem(`${SCROLL_POSITION_KEY_PREFIX}${path}`, position.toString());
  }
};

export const getScrollPosition = (path: string): number => {
  const position = localStorage.getItem(`${SCROLL_POSITION_KEY_PREFIX}${path}`);
  return position ? parseInt(position, 10) : 0;
};

export const clearScrollPosition = (path: string) => {
  localStorage.removeItem(`${SCROLL_POSITION_KEY_PREFIX}${path}`);
};
