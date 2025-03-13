
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Initial check
    checkMobile()
    
    // Modern event listener
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', checkMobile)
      return () => mql.removeEventListener('change', checkMobile)
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Return false as fallback until we know for sure
  return isMobile === undefined ? false : isMobile
}
