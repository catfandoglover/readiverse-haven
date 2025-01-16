import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/reader";

interface TableOfContentsProps {
  toc: NavItem[];
  currentLocation: string | null;
  onNavigate: (href: string) => void;
}

const TableOfContents = ({ toc, currentLocation, onNavigate }: TableOfContentsProps) => {
  return (
    <div className="w-[300px] h-[80vh] bg-background border-r">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Contents</h2>
      </div>
      <ScrollArea className="h-[calc(80vh-60px)]">
        <div className="p-4">
          {toc.map((item, index) => (
            <Button
              key={item.href + index}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 px-2",
                item.level && `pl-${item.level * 4}`,
                currentLocation === item.href && "bg-accent"
              )}
              onClick={() => onNavigate(item.href)}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
              {item.page && (
                <span className="ml-auto text-sm text-muted-foreground">
                  {item.page}
                </span>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TableOfContents;