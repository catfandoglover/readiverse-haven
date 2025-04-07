import { useEffect } from 'react';
import { setupViewportHeightFix, isMobileSafari } from '@/utils/safariFix';

/**
 * Hook to apply Safari viewport fixes in React components
 * Specifically addresses issues where Safari mobile browsers have UI elements
 * that affect the viewport height (address bar, bottom nav, etc.)
 * 
 * @returns {boolean} - Whether the current browser is Mobile Safari
 */
export const useSafariViewportFix = (): boolean => {
  const isSafariMobile = isMobileSafari();
  
  useEffect(() => {
    // Only apply the fix if needed
    if (!isSafariMobile) return;
    
    // Setup the viewport height fix and get cleanup function
    const cleanup = setupViewportHeightFix();
    
    // Clean up when the component unmounts
    return cleanup;
  }, [isSafariMobile]);
  
  return isSafariMobile;
}; 