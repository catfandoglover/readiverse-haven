
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { saveLastVisited } from '@/utils/navigationHistory';

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
      console.log('Saved last content path:', currentPath);
      
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
  
  return { getLastContentPath };
};
