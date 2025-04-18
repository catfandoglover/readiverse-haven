const LAST_VISITED_KEY_PREFIX = 'last-visited-';
const SCROLL_POSITION_KEY_PREFIX = 'scroll-position-';
const PREVIOUS_PAGE_KEY = 'previous-page';
const NAVIGATION_HISTORY_KEY = 'navigation-history';

export const sections = {
  dna: '/dna',
  discover: '/discover',
  bookshelf: '/bookshelf',
  profile: '/profile',
  dashboard: '/dashboard',
  classroom: '/classroom'
} as const;

// Store a stack of the last 10 visited pages to provide better back navigation
const saveNavigationHistory = (path: string) => {
  // Don't track detail view pages as previous pages to avoid circular navigation
  if (path.includes('/view/') || path.includes('/icons/') || path.includes('/texts/')) return;
  
  try {
    // Get current history or initialize empty array
    const historyString = localStorage.getItem(NAVIGATION_HISTORY_KEY);
    const history: string[] = historyString ? JSON.parse(historyString) : [];
    
    // Avoid duplicates in history
    if (history.length > 0 && history[history.length - 1] === path) return;
    
    // Add current path to history
    history.push(path);
    
    // Limit history to last 10 pages
    while (history.length > 10) {
      history.shift();
    }
    
    // Save updated history
    localStorage.setItem(NAVIGATION_HISTORY_KEY, JSON.stringify(history));
    
    console.log("Navigation history updated:", history);
  } catch (error) {
    console.error("Error saving navigation history:", error);
  }
};

/**
 * Saves the last visited path for a specific section
 */
export const saveLastVisited = (section: keyof typeof sections, path: string) => {
  localStorage.setItem(`${LAST_VISITED_KEY_PREFIX}${section}`, path);
  
  // Store current path as previous page for back navigation
  if (!path.includes('/view/') && !path.includes('/texts/')) {
    localStorage.setItem(PREVIOUS_PAGE_KEY, path);
    console.log("Saved previous page:", path);
  }
  
  // Update navigation history
  saveNavigationHistory(path);
};

/**
 * Gets the last visited path for a specific section or returns the default path
 */
export const getLastVisited = (section: keyof typeof sections): string => {
  const path = localStorage.getItem(`${LAST_VISITED_KEY_PREFIX}${section}`);
  console.log(`Retrieved last visited for ${section}:`, path);
  return path || sections[section];
};

/**
 * Returns the original content path the user was viewing before entering a detail view
 */
export const getOriginPath = (): string => {
  const sessionPath = sessionStorage.getItem('lastContentPath');
  if (sessionPath) {
    console.log("Found origin path in session:", sessionPath);
    return sessionPath;
  }
  
  // Fall back to previous page from history
  return getPreviousPage();
};

/**
 * Returns the previous page the user visited
 */
export const getPreviousPage = (): string => {
  // First check navigation history
  try {
    const historyString = localStorage.getItem(NAVIGATION_HISTORY_KEY);
    if (historyString) {
      const history: string[] = JSON.parse(historyString);
      
      // Find the last valid page in history (not a detail view)
      for (let i = history.length - 1; i >= 0; i--) {
        const page = history[i];
        if (!page.includes('/view/') && !page.includes('/icons/') && !page.includes('/texts/')) {
          return page;
        }
      }
    }
  } catch (error) {
    console.error("Error retrieving navigation history:", error);
  }
  
  // Fall back to previous page key if history lookup fails
  const previousPage = localStorage.getItem(PREVIOUS_PAGE_KEY);
  return previousPage || '/discover'; // Default to discover if no previous page
};

/**
 * Pops the last page from navigation history
 */
export const popNavigationHistory = (): string | null => {
  try {
    const historyString = localStorage.getItem(NAVIGATION_HISTORY_KEY);
    if (historyString) {
      const history: string[] = JSON.parse(historyString);
      if (history.length > 0) {
        const previousPage = history.pop();
        localStorage.setItem(NAVIGATION_HISTORY_KEY, JSON.stringify(history));
        return previousPage || null;
      }
    }
  } catch (error) {
    console.error("Error popping navigation history:", error);
  }
  return null;
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
