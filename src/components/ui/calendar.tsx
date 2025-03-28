
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-base font-medium text-[#E9E7E2]",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 bg-transparent p-0 opacity-80 hover:opacity-100 text-[#E9E7E2]"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-[#E9E7E2]/70 rounded-md w-10 font-medium text-[0.9rem] py-2",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          props.mode === 'range' ? "[&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md" : "",
          "h-10 w-10"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-full text-[#E9E7E2] hover:bg-[#373763]/30"
        ),
        day_range_end: "day-range-end",
        day_range_start: "day-range-start",
        day_selected: 
          "bg-[#373763] text-[#E9E7E2] hover:bg-[#373763]/90 hover:text-[#E9E7E2] focus:bg-[#373763] focus:text-[#E9E7E2]",
        day_today: "border border-[#E9E7E2]/30 text-[#E9E7E2]",
        day_outside:
          "day-outside text-[#E9E7E2]/30 opacity-50 aria-selected:bg-transparent aria-selected:text-[#E9E7E2]/30 aria-selected:opacity-30",
        day_disabled: "text-[#E9E7E2]/20 opacity-50 line-through",
        day_range_middle:
          "aria-selected:bg-[#373763]/20 aria-selected:text-[#E9E7E2]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5 text-[#E9E7E2]" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5 text-[#E9E7E2]" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
