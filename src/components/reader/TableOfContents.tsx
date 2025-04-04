import React from 'react';
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import type { NavItem } from "epubjs";

interface TableOfContentsProps {
  toc?: NavItem[];
  onNavigate: (href: string) => void;
  variant?: 'drawer' | 'inline';
}

const TocList = ({ 
  toc = [], 
  onNavigate, 
  closeDrawer 
}: { 
  toc: NavItem[]; 
  onNavigate: (href: string) => void; 
  closeDrawer?: () => void;
}) => {
  return (
    <div className="space-y-2">
      {toc.map((item, index) => (
        closeDrawer ? (
          <DrawerClose key={index} asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-left whitespace-normal h-auto text-foreground hover:bg-accent"
              onClick={() => onNavigate(item.href)}
            >
              <span className="line-clamp-2">{item.label}</span>
            </Button>
          </DrawerClose>
        ) : (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start text-left whitespace-normal h-auto text-foreground hover:bg-accent"
            onClick={() => onNavigate(item.href)}
          >
            <span className="line-clamp-2">{item.label}</span>
          </Button>
        )
      ))}
    </div>
  );
};

const TableOfContents = ({ toc = [], onNavigate, variant = 'drawer' }: TableOfContentsProps) => {
  const handleNavigation = (href: string) => {
    onNavigate(href);
  };

  if (variant === 'inline') {
    return (
      <ScrollArea className="h-[65vh]">
        <TocList toc={toc} onNavigate={handleNavigation} />
      </ScrollArea>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border border-border hover:bg-background/80"
        >
          <BookOpen className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-background">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-foreground">Table of Contents</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="h-[50vh] px-4">
            <TocList toc={toc} onNavigate={handleNavigation} closeDrawer={() => {}} />
          </ScrollArea>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="border-border text-foreground">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TableOfContents;
