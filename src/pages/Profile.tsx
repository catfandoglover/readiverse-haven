
import React, { useEffect } from "react";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Navigate } from "react-router-dom";
import { ProfileDataProvider } from "@/contexts/ProfileDataContext";

const Profile: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') as "become" | "profile" | null;
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    document.title = "Your Intellectual Profile | Intellectual DNA";
  }, []);
  
  // Add some debug logging
  useEffect(() => {
    console.log("[Profile] Rendering with auth state:", { 
      authLoading, 
      isAuthenticated: !!user,
      userId: user?.id 
    });
  }, [user, authLoading]);
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2A282A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E9E7E2] mb-4"></div>
          <p className="text-[#E9E7E2] font-oxanium">Authenticating...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <ProfileDataProvider>
      <ProfileLayout initialTab={initialTab || undefined} />
    </ProfileDataProvider>
  );
};

export default Profile;
