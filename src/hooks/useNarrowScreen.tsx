
import * as React from "react"

const NARROW_BREAKPOINT = 380

export function useIsNarrowScreen() {
  const [isNarrowScreen, setIsNarrowScreen] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${NARROW_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsNarrowScreen(window.innerWidth < NARROW_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsNarrowScreen(window.innerWidth < NARROW_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isNarrowScreen
}
