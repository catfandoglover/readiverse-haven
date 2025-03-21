
import React, { useEffect } from "react";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { useLocation } from "react-router-dom";

const Profile: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') as "become" | "profile" | null;

  useEffect(() => {
    document.title = "Your Intellectual Profile | Intellectual DNA";
  }, []);
  
  return <ProfileLayout initialTab={initialTab || undefined} />;
};

export default Profile;
