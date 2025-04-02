import * as React from "react"
import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
}

export function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-b-1",
    md: "h-6 w-6 border-b-2",
    lg: "h-10 w-10 border-b-2",
    xl: "h-16 w-16 border-b-3",
  }
  
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-current", 
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}