
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
      "ring-1 ring-black/10",
      className
    )}
    style={{
      background: "#373763"
    }}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 transition-all relative"
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
        background: "linear-gradient(to right, #b29eff, #9b87f5)",
        boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.1)"
      }}
    >
      <div 
        className="absolute right-0 top-0 h-full w-[2px] bg-white/20 blur-[1px]"
        style={{
          boxShadow: "0 0 2px rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1)"
        }}
      />
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
