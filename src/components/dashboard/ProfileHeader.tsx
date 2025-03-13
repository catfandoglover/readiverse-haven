
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Share, Hexagon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ProfileHeader: React.FC = () => {
  const { user } = useAuth();
  const [landscapeImage, setLandscapeImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const firstName = user?.Account?.Name?.split(' ')[0] || "Explorer";
  const lastName = user?.Account?.Name?.split(' ').slice(1).join(' ') || "";
  const email = user?.email || "user@example.com";
  const initials = `${firstName[0]}${lastName[0] || ""}`;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user?.Uid) {
        try {
          // Check if profiles table has the correct columns and structure
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
          
          // Determine the correct ID column - try id, user_id, or outseta_uid
          let query = supabase.from('profiles').select('*');
          
          // If we don't see outseta_uid in the schema, we'll try different ID fields
          if (columns && columns[0] && !Object.keys(columns[0]).includes('outseta_uid')) {
            if (Object.keys(columns[0]).includes('user_id')) {
              query = query.eq('user_id', user.Uid);
            } else {
              query = query.eq('id', user.Uid);
            }
          } else {
            query = query.eq('outseta_uid', user.Uid);
          }
          
          const { data, error } = await query.single();
            
          if (data && !error) {
            console.log("Profile data:", data);
            
            // Check if landscape_image field exists in the data
            if (data.landscape_image) {
              setLandscapeImage(data.landscape_image);
            }
            
            // Check if profile_image field exists in the data
            if (data.profile_image) {
              setProfileImage(data.profile_image);
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
      {/* Background with 50% opacity image */}
      <div className="w-full h-64 bg-[#2A282A] relative">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/landscape_images//Twilight%20Navigator.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: "0.5"
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#2A282A]/0 via-[#2A282A]/70 to-[#2A282A]"></div>
        
        {/* Share button - aligned with hamburger menu height */}
        <button className="absolute top-4 right-4 text-[#E9E7E2] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
          <Share className="h-5 w-5" />
        </button>
      </div>
      
      {/* Profile content */}
      <div className="absolute bottom-0 left-0 w-full p-6 text-[#E9E7E2]">
        <div className="flex items-end space-x-4">
          <div className="relative h-20 w-20">
            <Hexagon className="absolute h-20 w-20 text-[#CCFF23]" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center p-1">
              <Avatar className="h-full w-full overflow-hidden">
                <AvatarImage src={profileImage || "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/profile_images//Alex%20Jakubowski.png"} />
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          
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
