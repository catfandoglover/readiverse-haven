
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ProfileHeader: React.FC = () => {
  const { user } = useAuth();
  const [landscapeImage, setLandscapeImage] = useState<string | null>(null);
  
  const firstName = user?.Account?.Name?.split(' ')[0] || "Explorer";
  const lastName = user?.Account?.Name?.split(' ').slice(1).join(' ') || "";
  const email = user?.email || "user@example.com";
  const initials = `${firstName[0]}${lastName[0] || ""}`;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user?.Uid) {
        try {
          // Check if profiles table has the correct columns
          const { data: columns, error: columnsError } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);
            
          if (columnsError) {
            console.error("Error fetching profile schema:", columnsError);
            return;
          }
          
          // Log the column names to help debug
          console.log("Available columns in profiles table:", columns && columns[0] ? Object.keys(columns[0]) : []);
          
          // Fetch the user's profile from Supabase
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('outseta_uid', user.Uid)
            .single();
            
          if (data && !error) {
            console.log("Profile data:", data);
            // Check if landscape_image field exists in the data
            if ('landscape_image' in data) {
              setLandscapeImage(data.landscape_image);
            } else {
              console.error("landscape_image field not found in profile data");
            }
          } else {
            console.error("Error fetching profile data:", error);
          }
        } catch (e) {
          console.error("Exception fetching profile:", e);
        }
      }
    };
    
    fetchProfileData();
  }, [user]);

  // Default background image as fallback
  const backgroundImageUrl = landscapeImage || '/lovable-uploads/78b6880f-c65b-4b75-ab6c-8c1c3c45e81d.png';

  return (
    <div className="relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div 
        className="w-full h-64 bg-[#2A282A] relative"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(42, 40, 42, 0.8), #2A282A), url('${backgroundImageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#2A282A]/0 via-[#2A282A]/70 to-[#2A282A]"></div>
        
        {/* Lightning bolt overlay */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10">
          <img 
            src="/lovable-uploads/d9d3233c-fe72-450f-8173-b32959a3e396.png" 
            alt="" 
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Settings button */}
        <button className="absolute top-4 right-4 h-10 w-10 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center backdrop-blur-sm">
          <Settings className="h-5 w-5 text-[#E9E7E2]" />
        </button>
      </div>
      
      {/* Profile content */}
      <div className="absolute bottom-0 left-0 w-full p-6 text-[#E9E7E2]">
        <div className="flex items-end space-x-4">
          <Avatar className="h-20 w-20 border-2 border-[#9b87f5] shadow-lg">
            <AvatarImage src="" />
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h1 className="text-2xl font-serif">{firstName} {lastName}</h1>
            <p className="text-sm font-oxanium text-[#E9E7E2]/70 italic">Twilight Navigator</p>
            <p className="text-xs mt-1 text-[#E9E7E2]/60">{email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
