import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import MainMenu from "@/components/navigation/MainMenu";
import { MessageCircleMore } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ConversationHistorySidebar from "@/components/virgil/ConversationHistorySidebar";

const VirgilOffice: React.FC = () => {
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  return (
    <div 
      className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2] overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Virgil%20Office%20Background.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL1ZpcmdpbCBPZmZpY2UgQmFja2dyb3VuZC5wbmciLCJpYXQiOjE3NDM0NDI2MzIsImV4cCI6ODY1NzQzMzU2MjMyfQ.u9O5s34hwkae_FAye8neH2H3CvpjcjvCmICIn6xzUAE')" }}
    >
      <div className="flex items-center pt-4 px-4">
        <MainMenu />
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          Virgil's Office
        </h2>
        <button
          onClick={() => setIsHistorySidebarOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-md text-[#E9E7E2] focus:outline-none"
          aria-label="Chat History"
        >
          <MessageCircleMore className="h-7 w-7" />
        </button>
      </div>
      
      <main className="flex-1 relative overflow-y-auto">
        <div className={cn(
          "flex flex-col items-center h-full",
          isMobile ? "justify-start pt-[25vh]" : "justify-start pt-[15vh] px-6 py-10"
        )}>
          <div className="max-w-md w-full mx-auto text-center px-6">
            <h1 
              className="font-libre-baskerville bold text-[#E9E7E2] text-3xl md:text-4xl" 
              style={{ textShadow: "0 4px 8px rgba(0,0,0,0.5)" }}
            >
              What brings you<br />
              here today?
            </h1>
            
            <div className={cn(
              "space-y-4",
              isMobile ? "mt-6" : "mt-8"
            )}>
              <Button
                className="w-full py-4 rounded-2xl bg-[#332E38]/80 hover:bg-[#332E38] hover:outline hover:outline-1 hover:outline-[#CCFF23] text-[#E9E7E2] font-oxanium text-sm uppercase font-bold tracking-wider transition-all shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                onClick={() => navigate("/virgil-modes")}
              >
                CHAT WITH VIRGIL
              </Button>
              
              <Button
                className="w-full py-4 rounded-2xl bg-[#332E38]/80 hover:bg-[#332E38] hover:outline hover:outline-1 hover:outline-[#CCFF23] text-[#E9E7E2] font-oxanium text-sm uppercase font-bold tracking-wider transition-all shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                onClick={() => navigate("/classroom")}
              >
                TAKE A COURSE
              </Button>
              
              <Button
                className="w-full py-4 rounded-2xl bg-[#332E38]/80 hover:bg-[#332E38] hover:outline hover:outline-1 hover:outline-[#CCFF23] text-[#E9E7E2] font-oxanium text-sm uppercase font-bold tracking-wider transition-all shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                onClick={() => navigate("/exam-room")}
              >
                TEST MY KNOWLEDGE
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <ConversationHistorySidebar 
        open={isHistorySidebarOpen} 
        onOpenChange={setIsHistorySidebarOpen} 
      />
    </div>
  );
};

export default VirgilOffice;
