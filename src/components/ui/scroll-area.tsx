import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

// Define a type for the viewport ref
type ViewportRef = React.RefObject<HTMLDivElement>;

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    enableDragging?: boolean;
    orientation?: "horizontal" | "vertical";
    viewportRef?: ViewportRef; // Add viewportRef prop
  }
>(({ className, children, enableDragging, orientation = "vertical", viewportRef: externalViewportRef, ...props }, ref) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const internalViewportRef = React.useRef<HTMLDivElement>(null);
  
  // Combine internal and external refs if needed, or prioritize external if provided
  const combinedViewportRef = externalViewportRef || internalViewportRef;
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enableDragging || !combinedViewportRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - combinedViewportRef.current.offsetLeft);
    setScrollLeft(combinedViewportRef.current.scrollLeft);
    combinedViewportRef.current.style.cursor = 'grabbing';
    combinedViewportRef.current.style.userSelect = 'none';
  };
  
  const handleMouseUp = () => {
    if (!enableDragging || !combinedViewportRef.current) return;
    setIsDragging(false);
    combinedViewportRef.current.style.cursor = 'grab';
    combinedViewportRef.current.style.removeProperty('user-select');
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !enableDragging || !combinedViewportRef.current) return;
    e.preventDefault();
    const x = e.pageX - combinedViewportRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Speed multiplier
    combinedViewportRef.current.scrollLeft = scrollLeft - walk;
  };

  // Handle touch events for mobile swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableDragging || !combinedViewportRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - combinedViewportRef.current.offsetLeft);
    setScrollLeft(combinedViewportRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !enableDragging || !combinedViewportRef.current) return;
    const x = e.touches[0].pageX - combinedViewportRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    combinedViewportRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    if (!enableDragging) return;
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (enableDragging && combinedViewportRef.current) {
      combinedViewportRef.current.style.cursor = 'grab';
    }
  }, [enableDragging, combinedViewportRef]);

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={combinedViewportRef}
        className={cn(
          "h-full w-full rounded-[inherit]",
          enableDragging && "cursor-grab touch-pan-x"
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar orientation={orientation} />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
})
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
