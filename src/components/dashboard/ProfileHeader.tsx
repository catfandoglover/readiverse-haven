import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Share, Pen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "../ui/button";

interface ProfileData {
  id: string;
  outseta_user_id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  landscape_image?: string;
  profile_image?: string;
}

const ProfileHeader: React.FC = () => {
  const { user, openProfile } = useAuth();
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
          const { data: columns, error: columnsError } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);
            
          if (columnsError) {
            console.error("Error fetching profile schema:", columnsError);
            return;
          }
          
          console.log("Available columns in profiles table:", columns && columns[0] ? Object.keys(columns[0]) : []);
          
          let query = supabase.from('profiles').select('*');
          
          if (columns && columns[0]) {
            const columnNames = Object.keys(columns[0]);
            if (columnNames.includes('outseta_uid')) {
              query = query.eq('outseta_uid', user.Uid);
            } else if (columnNames.includes('user_id')) {
              query = query.eq('user_id', user.Uid);
            } else if (columnNames.includes('outseta_user_id')) {
              query = query.eq('outseta_user_id', user.Uid);
            } else {
              query = query.eq('id', user.Uid);
            }
          }
          
          const { data, error } = await query.single();
            
          if (data && !error) {
            console.log("Profile data:", data);
            
            const profileData = data as ProfileData;
            
            if (profileData.landscape_image) {
              setLandscapeImage(profileData.landscape_image);
            }
            
            if (profileData.profile_image) {
              setProfileImage(profileData.profile_image);
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

  const backgroundImageUrl = landscapeImage || '/lovable-uploads/78b6880f-c65b-4b75-ab6c-8c1c3c45e81d.png';

  const handleProfileEditClick = () => {
    openProfile({ tab: 'profile' });
  };

  return (
    <div className="relative overflow-hidden">
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
        
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-[#E9E7E2] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] p-1">
          <Share className="h-7.5 w-7.5" />
        </Button>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full p-6 text-[#E9E7E2]">
        <div className="flex items-end space-x-4">
          <div className="relative h-20 w-20">
            <svg 
              viewBox="0 0 100 100" 
              className="absolute inset-0 h-full w-full text-[#CCFF23]"
            >
              <polygon 
                points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4"
              />
            </svg>
            
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ 
                clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
              }}
            >
              <Avatar className="h-full w-full overflow-hidden rounded-none">
                <AvatarImage src={profileImage || "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/profile_images//Alex%20Jakubowski.png"} />
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] text-white rounded-none">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <button 
              onClick={handleProfileEditClick}
              className="absolute -bottom-.5 -right-1 bg-white rounded-full p-1 shadow-md cursor-pointer hover:bg-#E9E7E2 transition-colors"
              aria-label="Edit profile picture"
            >
              <Pen size={12} className="text-gray-700" />
            </button>
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
