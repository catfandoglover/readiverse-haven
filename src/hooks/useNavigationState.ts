
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { saveLastVisited, sections, getOriginPath } from '@/utils/navigationHistory';

type ContentType = 'classic' | 'icon' | 'concept' | 'question' | 'for-you';

/**
 * Hook to manage navigation state and track where the user came from
 */
export const useNavigationState = () => {
  const location = useLocation();
  
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

  const saveSourcePath = (path: string) => {
    sessionStorage.setItem('sourcePath', path);
    console.log('[NavigationState] Saved source path:', path);
  };

  const getSourcePath = () => {
    const sourcePath = sessionStorage.getItem('sourcePath');
    if (sourcePath) {
      console.log('[NavigationState] Retrieved source path:', sourcePath);
      return sourcePath;
    }
    return getOriginPath();
  };
  
  return { 
    getLastContentPath, 
    getContentType,
    saveSourcePath,
    getSourcePath
  };
};
