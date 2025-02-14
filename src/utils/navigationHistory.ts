
const STORAGE_PREFIX = 'last_visited_';

export const saveLastVisited = (section: string, path: string) => {
  localStorage.setItem(`${STORAGE_PREFIX}${section}`, path);
};

export const getLastVisited = (section: string): string | null => {
  return localStorage.getItem(`${STORAGE_PREFIX}${section}`);
};
