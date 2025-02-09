
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-1 w-full overflow-hidden rounded-full",
      className
    )}
    style={{
      background: "linear-gradient(to right, #FEF7CD, rgba(205, 245, 81, 0.9))"
    }}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 transition-all relative"
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
        background: "linear-gradient(to right, #9b87f5, #7E69AB)",
      }}
    >
      <div 
        className="absolute right-0 top-0 h-full"
        style={{
          width: '2px',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.7), rgba(255,255,255,0.1))',
          boxShadow: `
            1px 0 0 rgba(255,255,255,0.7),
            2px 0 1px rgba(255,255,255,0.3),
            -1px 0 0 rgba(255,255,255,0.5)
          `
        }}
      />
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
