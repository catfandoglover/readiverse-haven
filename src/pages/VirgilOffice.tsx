
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import MainMenu from "@/components/navigation/MainMenu";
import VirgilChatInterface from "@/components/virgil/VirgilChatInterface";
import { MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const VirgilOffice: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div 
      className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2] overflow-hidden bg-cover bg-center bg-no-repeat opacity-75"
      style={{ backgroundImage: "url('https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Virgil%20Office%20Background.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL1ZpcmdpbCBPZmZpY2UgQmFja2dyb3VuZC5wbmciLCJpYXQiOjE3NDI1NzU3OTksImV4cCI6MjYwNjQ4OTM5OX0.Dfld0HEUCOC3JgTCI5e1ngjUBBX1ZeuvefXWmCOjmqU')" }}
    >
      <div className="flex items-center pt-4 px-4">
        <MainMenu />
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          Virgil's Office
        </h2>
        <Button
          variant="ghost" 
          size="icon"
          className="w-10 h-10 rounded-md text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#4A4351]/50"
          aria-label="Chat History"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>
      
      <main className={cn(
        "flex-1 relative overflow-y-auto transition-transform duration-300",
        isChatOpen && "transform -translate-y-full"
      )}>
        {/* Adjust the main content container with mobile-specific styling */}
        <div className={cn(
          "flex flex-col items-center justify-center h-full",
          isMobile ? "px-4 py-12" : "px-6 py-10" // Reduced padding on mobile and add bottom padding for iOS navigation
        )}>
          <div className={cn(
            "max-w-md w-full mx-auto text-center",
            isMobile && "mt-0" // Remove top margin on mobile
          )}>
            <h1 
              className="font-baskerville text-[#2A282A] text-3xl md:text-4xl font-bold" 
              style={{ textShadow: "0 4px 8px rgba(0,0,0,0.5)" }}
            >
              What brings you here today?
            </h1>
            
            <div className={cn(
              "space-y-4",
              isMobile ? "mt-6" : "mt-8" // Reduced top margin on mobile
            )}>
              <Button
                className="w-full py-4 rounded-2xl bg-[#332E38]/50 hover:bg-[#332E38] hover:outline hover:outline-1 hover:outline-[#CCFF23] text-[#E9E7E2] font-oxanium text-sm uppercase font-bold tracking-wider transition-all shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                onClick={() => setIsChatOpen(true)}
              >
                CHAT WITH VIRGIL
              </Button>
              
              <Button
                className="w-full py-4 rounded-2xl bg-[#332E38]/50 hover:bg-[#332E38] hover:outline hover:outline-1 hover:outline-[#CCFF23] text-[#E9E7E2] font-oxanium text-sm uppercase font-bold tracking-wider transition-all shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                onClick={() => console.log("Take a course clicked")}
              >
                TAKE A COURSE
              </Button>
              
              <Button
                className="w-full py-4 rounded-2xl bg-[#332E38]/50 hover:bg-[#332E38] hover:outline hover:outline-1 hover:outline-[#CCFF23] text-[#E9E7E2] font-oxanium text-sm uppercase font-bold tracking-wider transition-all shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                onClick={() => console.log("Test my knowledge clicked")}
              >
                TEST MY KNOWLEDGE
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <VirgilChatInterface 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        variant="virgilchat"
      />
    </div>
  );
};

export default VirgilOffice;
