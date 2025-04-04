import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

const CustomSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track 
      className="relative h-2 w-full grow overflow-hidden rounded-full ring-1 ring-black/10"
      style={{
        background: "#373763"
      }}
    >
      <SliderPrimitive.Range 
        className="absolute h-full flex-1 transition-all relative"
        style={{ 
          background: "linear-gradient(to right, #b29eff, #9b87f5)",
          boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.1)"
        }}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb 
      className="block h-4 w-4 rounded-full bg-white/90 ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
      style={{
        boxShadow: "0 0 2px rgba(255, 255, 255, 0.2), 0 0 4px rgba(0, 0, 0, 0.2)"
      }}
    />
  </SliderPrimitive.Root>
))

CustomSlider.displayName = SliderPrimitive.Root.displayName

export { CustomSlider } 