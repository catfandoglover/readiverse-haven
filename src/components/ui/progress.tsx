
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
        className="absolute right-0 top-0 h-full w-[3px] bg-white/40 blur-[2px]"
        style={{
          boxShadow: "0 0 4px rgba(255, 255, 255, 0.4), 0 0 6px rgba(255, 255, 255, 0.2)"
        }}
      />
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
