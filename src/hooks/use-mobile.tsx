
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize with server-safe check and use window dimensions if available
  const [isMobile, setIsMobile] = React.useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  )

  React.useEffect(() => {
    // Function to check mobile status based on viewport width
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth
        const mobileStatus = width < MOBILE_BREAKPOINT
        setIsMobile(mobileStatus)
        console.log("[useIsMobile] Screen width detected:", width, "isMobile:", mobileStatus)
      }
    }
    
    // Initial check on mount
    checkMobile()
    
    // Handle window resize events
    window.addEventListener("resize", checkMobile)
    
    // Handle orientation change events with delay to ensure accurate dimensions
    window.addEventListener("orientationchange", () => {
      // The timeout ensures we get the updated dimensions after the orientation change completes
      setTimeout(checkMobile, 150)
    })
    
    return () => {
      // Clean up event listeners
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("orientationchange", checkMobile)
    }
  }, [])

  return isMobile
}
