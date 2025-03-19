
const LAST_VISITED_KEY_PREFIX = 'last-visited-';
const SCROLL_POSITION_KEY_PREFIX = 'scroll-position-';
const PREVIOUS_PAGE_KEY = 'previous-page';

export const sections = {
  dna: '/dna',   // Changed from '/' to '/dna'
  discover: '/discover',
  bookshelf: '/bookshelf',
  dashboard: '/dashboard'
} as const;

/**
 * Saves the last visited path for a specific section
 */
export const saveLastVisited = (section: keyof typeof sections, path: string) => {
  localStorage.setItem(`${LAST_VISITED_KEY_PREFIX}${section}`, path);
  
  // Also save as previous page for back navigation
  const currentPage = localStorage.getItem(PREVIOUS_PAGE_KEY);
  if (currentPage !== path) {
    localStorage.setItem(PREVIOUS_PAGE_KEY, path);
  }
};

/**
 * Gets the last visited path for a specific section or returns the default path
 */
export const getLastVisited = (section: keyof typeof sections): string => {
  return localStorage.getItem(`${LAST_VISITED_KEY_PREFIX}${section}`) || sections[section];
};

/**
 * Returns the previous page the user visited
 */
export const getPreviousPage = (): string => {
  return localStorage.getItem(PREVIOUS_PAGE_KEY) || '/discover';
};

/**
 * Clears the last visited path for a specific section
 */
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
