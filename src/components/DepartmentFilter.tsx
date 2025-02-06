import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";

interface DepartmentFilterProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepartmentFilter = ({ isOpen, onClose }: DepartmentFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex justify-between items-center">
            <span>Search</span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <Input
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DepartmentFilter;