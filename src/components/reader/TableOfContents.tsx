import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronRight, AlignJustify } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import type { NavItem } from "@/types/reader";

interface TableOfContentsProps {
  toc: NavItem[];
  currentLocation: string | null;
  onNavigate: (href: string) => void;
}

const TableOfContents = ({ toc, currentLocation, onNavigate }: TableOfContentsProps) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="h-10 w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
        >
          <AlignJustify className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Table of Contents</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
            <div className="pr-4">
              {toc.map((item, index) => (
                <Button
                  key={item.href + index}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 px-2 mb-1",
                    item.level && `ml-${item.level * 4}`,
                    currentLocation === item.href && "bg-accent"
                  )}
                  onClick={() => {
                    onNavigate(item.href);
                  }}
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
      </DrawerContent>
    </Drawer>
  );
};

export default TableOfContents;