
import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { saveLastVisited, sections, getOriginPath } from '@/utils/navigationHistory';

type ContentType = 'classic' | 'icon' | 'concept' | 'question' | 'for-you';

/**
 * Hook to manage navigation state and track where the user came from
 */
export const useNavigationState = () => {
  const location = useLocation();
  const [currentSourcePath, setCurrentSourcePath] = useState<string | null>(null);
  const [feedSourcePath, setFeedSourcePath] = useState<string | null>(null);
  
  // Store the current path in session storage when it changes
  useEffect(() => {
    if (!location.pathname.includes('/view/')) {
      // Track the exact path for better navigation
      const currentPath = location.pathname;
      sessionStorage.setItem('lastContentPath', currentPath);
      console.log('[NavigationState] Saved last content path:', currentPath);
      
      // Save feed path specifically - this is critical for proper back navigation
      if (location.pathname.includes('/discover')) {
        const feedPath = location.pathname;
        sessionStorage.setItem('feedSourcePath', feedPath);
        setFeedSourcePath(feedPath);
        console.log('[NavigationState] Saved feed source path:', feedPath);
      }
      
      // Also save to the standard navigation history
      const section = location.pathname.includes('/discover') ? 'discover' : 
                      location.pathname.includes('/bookshelf') ? 'bookshelf' : 
                      location.pathname.includes('/profile') ? 'profile' : 
                      location.pathname.includes('/dna') ? 'dna' :
                      location.pathname.includes('/dashboard') ? 'dashboard' : 'discover';
                      
      saveLastVisited(section as any, currentPath);
    }
  }, [location.pathname]);
  
  const getLastContentPath = useCallback(() => {
    return sessionStorage.getItem('lastContentPath') || '/discover';
  }, []);

  /**
   * Determines the content type from the current URL
   */
  const getContentType = useCallback((): ContentType => {
    const pathname = location.pathname;
    
    if (pathname.includes('/view/classic/')) return 'classic';
    if (pathname.includes('/view/icon/')) return 'icon';
    if (pathname.includes('/view/concept/')) return 'concept';
    if (pathname.includes('/view/question/')) return 'question';
    if (pathname.includes('/discover/search/classics')) return 'classic';
    if (pathname.includes('/discover/search/icons')) return 'icon';
    if (pathname.includes('/discover/search/concepts')) return 'concept';
    if (pathname.includes('/discover/search/questions')) return 'question';
    
    return 'for-you';
  }, [location.pathname]);

  /**
   * Saves the source path to session storage for back navigation
   * This is critically important for proper back navigation
   */
  const saveSourcePath = useCallback((path: string) => {
    // Only save non-detail view paths
    if (!path.includes('/view/')) {
      sessionStorage.setItem('sourcePath', path);
      setCurrentSourcePath(path);
      console.log('[NavigationState] Saved source path:', path);
    }
  }, []);

  /**
   * Gets the feed source path specifically for returning from detail views
   * This ensures we return to the correct feed (FOR YOU vs ICONS, etc.)
   */
  const getFeedSourcePath = useCallback(() => {
    // First check component state
    if (feedSourcePath) {
      console.log('[NavigationState] Using feed source path from state:', feedSourcePath);
      return feedSourcePath;
    }
    
    // Then check session storage
    const storedFeedPath = sessionStorage.getItem('feedSourcePath');
    if (storedFeedPath) {
      console.log('[NavigationState] Using feed source path from session:', storedFeedPath);
      return storedFeedPath;
    }
    
    // Fall back to regular source path
    return getSourcePath();
  }, [feedSourcePath]);

  /**
   * Gets the source path from which the user navigated
   * Uses a consistent priority order for reliable back navigation
   */
  const getSourcePath = useCallback(() => {
    // First check component state for the most up-to-date value
    if (currentSourcePath) {
      console.log('[NavigationState] Retrieved source path from state:', currentSourcePath);
      return currentSourcePath;
    }
    
    // Then check session storage
    const sourcePath = sessionStorage.getItem('sourcePath');
    if (sourcePath) {
      console.log('[NavigationState] Retrieved source path from session:', sourcePath);
      setCurrentSourcePath(sourcePath);
      return sourcePath;
    }
    
    // Fall back to navigation history
    const originPath = getOriginPath();
    console.log('[NavigationState] Falling back to origin path:', originPath);
    return originPath;
  }, [currentSourcePath]);
  
  return { 
    getLastContentPath, 
    getContentType,
    saveSourcePath,
    getSourcePath,
    getFeedSourcePath,
    currentSourcePath
  };
};
