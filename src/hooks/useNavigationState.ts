
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { saveLastVisited, sections, getOriginPath } from '@/utils/navigationHistory';

type ContentType = 'classic' | 'icon' | 'concept' | 'question' | 'for-you';

/**
 * Hook to manage navigation state and track where the user came from
 */
export const useNavigationState = () => {
  const location = useLocation();
  const [currentSourcePath, setCurrentSourcePath] = useState<string | null>(null);
  
  useEffect(() => {
    // Store the current path in session storage when it changes
    // This helps us track where the user navigated from
    if (!location.pathname.includes('/view/')) {
      // Track the exact path for better navigation
      const currentPath = location.pathname;
      sessionStorage.setItem('lastContentPath', currentPath);
      console.log('[NavigationState] Saved last content path:', currentPath);
      
      // Also save to the standard navigation history
      const section = location.pathname.includes('/discover') ? 'discover' : 
                      location.pathname.includes('/bookshelf') ? 'bookshelf' : 
                      location.pathname.includes('/profile') ? 'profile' : 
                      location.pathname.includes('/dna') ? 'dna' :
                      location.pathname.includes('/dashboard') ? 'dashboard' : 'discover';
                      
      saveLastVisited(section as any, currentPath);
    }
  }, [location.pathname]);
  
  const getLastContentPath = () => {
    return sessionStorage.getItem('lastContentPath') || '/discover';
  };

  /**
   * Determines the content type from the current URL
   */
  const getContentType = (): ContentType => {
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
  };

  /**
   * Saves the source path to session storage for back navigation
   * This is critically important for proper back navigation
   */
  const saveSourcePath = (path: string) => {
    // Only save non-detail view paths
    if (!path.includes('/view/')) {
      sessionStorage.setItem('sourcePath', path);
      setCurrentSourcePath(path);
      console.log('[NavigationState] Saved source path:', path);
    }
  };

  /**
   * Gets the source path from which the user navigated
   * Prioritizes the current component state over session storage
   */
  const getSourcePath = () => {
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
  };
  
  return { 
    getLastContentPath, 
    getContentType,
    saveSourcePath,
    getSourcePath,
    currentSourcePath
  };
};
