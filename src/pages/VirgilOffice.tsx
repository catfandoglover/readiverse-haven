
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import MainMenu from "@/components/navigation/MainMenu";

const VirgilOffice: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2] overflow-hidden">
      <div className="flex items-center pt-4 px-4">
        <MainMenu />
        <h2 className="font-oxanium uppercase text-[#E9E7E2]/50 tracking-wider text-sm font-bold mx-auto">
          Virgil's Office
        </h2>
        <div className="w-10"></div> {/* Spacer to balance the MainMenu width */}
      </div>
      
      <main className="flex-1 relative overflow-y-auto">
        <div className="flex flex-col items-center justify-center h-full px-6 py-10">
          <div className="max-w-md w-full mx-auto text-center">
            <h1 className="font-baskerville text-[#E9E7E2] text-3xl md:text-4xl leading-tight">
              What brings you here today?
            </h1>
            
            <div className="space-y-4 mt-8">
              <Button
                className="w-full py-4 rounded-2xl bg-[#332E38] hover:bg-[#332E38]/80 hover:opacity-90 border border-[#E9E7E2]/20 text-[#E9E7E2] font-oxanium text-sm uppercase font-bold tracking-wider transition-all"
                onClick={() => console.log("Chat with Virgil clicked")}
              >
                CHAT WITH VIRGIL
              </Button>
              
              <Button
                className="w-full py-4 rounded-2xl bg-[#332E38] hover:bg-[#332E38]/80 hover:opacity-90 border border-[#E9E7E2]/20 text-[#E9E7E2] font-oxanium text-sm uppercase font-bold tracking-wider transition-all"
                onClick={() => console.log("Take a course clicked")}
              >
                TAKE A COURSE
              </Button>
              
              <Button
                className="w-full py-4 rounded-2xl bg-[#332E38] hover:bg-[#332E38]/80 hover:opacity-90 border border-[#E9E7E2]/20 text-[#E9E7E2] font-oxanium text-sm uppercase font-bold tracking-wider transition-all"
                onClick={() => console.log("Test my knowledge clicked")}
              >
                TEST MY KNOWLEDGE
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VirgilOffice;
