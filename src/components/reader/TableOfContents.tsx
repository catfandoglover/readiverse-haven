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
import { toast } from "sonner";

interface TableOfContentsProps {
  toc: NavItem[];
  onNavigate: (href: string) => void;
}

const TableOfContents = ({ toc, onNavigate }: TableOfContentsProps) => {
  const handleNavigation = (href: string) => {
    onNavigate(href);
    toast("Navigating to chapter...");
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
        >
          <BookOpen className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Table of Contents</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="h-[50vh] px-4">
            <div className="space-y-2">
              {toc.map((item, index) => (
                <DrawerClose key={index} asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left whitespace-normal h-auto"
                    onClick={() => handleNavigation(item.href)}
                  >
                    <span className="line-clamp-2">{item.label}</span>
                  </Button>
                </DrawerClose>
              ))}
            </div>
          </ScrollArea>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TableOfContents;