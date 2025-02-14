
const STORAGE_PREFIX = 'last_visited_';
const SCROLL_PREFIX = 'scroll_position_';

export const saveLastVisited = (section: string, path: string) => {
  localStorage.setItem(`${STORAGE_PREFIX}${section}`, path);
};

export const getLastVisited = (section: string): string | null => {
  return localStorage.getItem(`${STORAGE_PREFIX}${section}`);
};

export const saveScrollPosition = (section: string, position: number) => {
  localStorage.setItem(`${SCROLL_PREFIX}${section}`, position.toString());
};

export const getScrollPosition = (section: string): number => {
  return Number(localStorage.getItem(`${SCROLL_PREFIX}${section}`)) || 0;
};
