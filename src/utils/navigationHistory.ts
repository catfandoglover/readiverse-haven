
const LAST_VISITED_KEY_PREFIX = 'last-visited-';

export const sections = {
  dna: '/dna',
  discover: '/',
  bookshelf: '/bookshelf'
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
