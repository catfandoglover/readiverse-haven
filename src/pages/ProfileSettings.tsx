import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useProfileData } from "@/contexts/ProfileDataContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Camera, CreditCard, LogOut, Pencil, ArrowUp, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

const ProfileSettings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profileData, refreshProfileData } = useProfileData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subscription, isLoading: subscriptionLoading, refresh: refreshSubscription } = useSubscription();
  
  // Add console log to debug subscription data
  useEffect(() => {
    console.log("Subscription data:", subscription);

    // Directly check the database to compare with the hook data
    const checkDatabaseSubscription = async () => {
      if (!user) return;
      
      try {
        // Make a direct API call to verify the data
        const { data, error } = await supabase
          .from('customers')
          .select('subscription_status, subscription_tier')
          .eq('user_id', user.id)
          .single();
          
        console.log("Direct database check - Customer data:", data, error);
        
        // Try a direct fetch to the debug endpoint
        try {
          const debugResponse = await fetch(
            `https://myeyoafugkrkwcnfedlu.supabase.co/functions/v1/get-membership-prices?check_user=${user.id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          const debugDataDirect = await debugResponse.json();
          console.log("Debug endpoint via direct fetch - Customer data:", debugDataDirect);
        } catch (fetchError) {
          console.error("Error in direct fetch to debug endpoint:", fetchError);
        }
      } catch (err) {
        console.error("Error in debug check:", err);
      }
    };
    
    checkDatabaseSubscription();
  }, [subscription, user]);
  
  const [fullName, setFullName] = useState(profileData?.full_name || user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Update local state when profileData changes
  useEffect(() => {
    if (profileData) {
      setFullName(profileData.full_name || user?.user_metadata?.full_name || "");
    }
  }, [profileData, user]);
  
  const fullNameParts = fullName ? fullName.split(' ') : ["", ""];
  const firstName = fullNameParts[0];
  const lastName = fullNameParts.slice(1).join(' ');
  const initials = firstName && lastName ? `${firstName[0]}${lastName[0]}` : "";
  
  const profileImage = profileData?.profile_image || null;
  const FALLBACK_ICON = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Lightning.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL0xpZ2h0bmluZy5qcGVnIiwiaWF0IjoxNzQzNjI4OTkwLCJleHAiOjg2NTc0MzU0MjU5MH0.iC8ooiUUENlvy-6ZtRexi_3jIJS5lBy2Y5FnUM82p9o";

  const handleBack = () => {
    navigate('/profile');
  };

  const handleUpdateName = async () => {
    if (!user || !fullName) return;
    
    setIsUpdatingName(true);
    
    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      
      if (authError) throw authError;
      
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('user_id', user.id);
      
      if (dbError) throw dbError;
      
      await refreshProfileData();
      setFullName(fullName);
      setIsEditingName(false);
      
      toast({
        title: "Success",
        description: "Name updated successfully",
      });
    } catch (error) {
      console.error("Error updating name:", error);
      toast({
        title: "Error",
        description: "Failed to update name",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    
    setIsUpdatingPassword(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Reset Password Link Sent",
        description: "Check your email for instructions to reset your password.",
        variant: "default",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error",
        description: "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 2MB",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `profile-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });
      
      if (uploadError) throw uploadError;
      
      const { data: publicURLData } = supabase.storage
        .from('profile_images')
        .getPublicUrl(fileName);
      
      if (!publicURLData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image: publicURLData.publicUrl })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      // Create a temporary URL for immediate display
      const tempImageUrl = URL.createObjectURL(file);
      
      // Update the profile image in state immediately
      if (profileData) {
        const updatedProfileData = { ...profileData, profile_image: tempImageUrl };
        // Apply the new image URL to any UI elements that use profileData
        document.querySelectorAll('[data-profile-image="true"]').forEach((element) => {
          if (element instanceof HTMLImageElement) {
            element.src = tempImageUrl;
          }
        });
      }
      
      await refreshProfileData();
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBillingPortal = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to access billing.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const returnUrl = `${window.location.origin}/profile/settings`;
      const { data, error } = await supabase.functions.invoke('create-stripe-portal', {
        body: { 
          userId: user.id,
          returnUrl: returnUrl
        }
      });
      
      if (error || !data?.url) {
        throw error || new Error("Failed to generate billing portal link");
      }
      
      window.open(data.url, '_blank');
    } catch (error) {
      console.error("Error accessing billing portal:", error);
      toast({
        title: "Error",
        description: "Failed to access billing portal",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#2A282A] text-[#E9E7E2] flex flex-col">
      {/* Fixed Header */}
      <div className="flex items-center pt-4 px-4 bg-[#2A282A] text-[#E9E7E2] sticky top-0 z-10 h-16">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-md text-[#E9E7E2]/70 hover:text-[#E9E7E2] focus:outline-none"
          aria-label="Back to Profile"
        >
          <ArrowLeft className="h-7 w-7" />
        </button>
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          PROFILE SETTINGS
        </h2>
        <div className="w-10 h-10">
          {/* Empty div to balance the layout */}
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col space-y-8 max-w-md mx-auto px-4 py-8 pb-24">
          {/* Profile Picture */}
          <div className="relative h-32 w-32 mx-auto">
            <svg 
              viewBox="0 0 100 100" 
              className="absolute inset-0 h-full w-full text-[#CCFF23]"
            >
              <polygon 
                points="50 5, 90 30, 90 70, 50 95, 10 70, 10 30" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3"
              />
            </svg>
            
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ 
                clipPath: 'polygon(50% 5%, 90% 30%, 90% 70%, 50% 95%, 10% 70%, 10% 30%)',
              }}
            >
              <div className="relative w-40 h-40 mx-auto mb-4">
                <Avatar className="h-full w-full overflow-hidden rounded-none">
                  <AvatarImage src={profileImage || FALLBACK_ICON} data-profile-image="true" />
                  <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] text-white rounded-none">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <label 
              className="absolute bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
              style={{
                bottom: '25%',
                right: '-1px',
              }}
              aria-label="Upload new picture"
            >
              <Camera size={18} className="text-gray-700" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Name */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold">NAME</h3>
              <Button 
                variant="ghost"
                size="sm"
                onClick={isEditingName ? handleUpdateName : () => setIsEditingName(true)}
                disabled={isUpdatingName}
                className="text-[#E9E7E2] hover:text-[#E9E7E2] hover:bg-transparent underline font-oxanium uppercase text-sm font-bold"
              >
                {isEditingName ? (
                  isUpdatingName ? "SAVING..." : "SAVE"
                ) : (
                  "EDIT"
                )}
              </Button>
            </div>
            <Card className="bg-[#373741] border-0 shadow-xl rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {isEditingName ? (
                      <Input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-[#2A282A] border-[#4D4955] text-[#E9E7E2] font-oxanium uppercase font-bold text-sm"
                        placeholder="Full Name"
                      />
                    ) : (
                      <p className="text-[#E9E7E2]/50 font-oxanium uppercase font-bold text-sm">{fullName}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold">EMAIL</h3>
            </div>
            <Card className="bg-[#373741] border-0 shadow-xl rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-[#E9E7E2]/50 font-oxanium uppercase font-bold text-sm">{email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Membership */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold">MEMBERSHIP</h3>
            </div>
            <Card className="bg-[#373741] border-0 shadow-xl rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {subscriptionLoading ? (
                      <p className="text-[#E9E7E2]/50 font-oxanium uppercase font-bold text-sm">LOADING...</p>
                    ) : (
                      <p className="text-[#E9E7E2]/50 font-oxanium uppercase font-bold text-sm">
                        {subscription.isActive 
                          ? (subscription.tier?.toLowerCase() === 'surge' ? 'SURGE' : 'FREE') 
                          : 'FREE'}
                      </p>
                    )}
                  </div>
                  <Button 
                    className="h-9 w-9 rounded-full flex-shrink-0 bg-[#373763] flex items-center justify-center"
                    onClick={() => navigate('/membership')}
                  >
                    <ArrowUp className="h-4 w-4 text-transparent stroke-white" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sign Out Button */}
          <div className="w-full pt-4">
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="w-full h-[52px] rounded-2xl bg-red-600 hover:bg-red-700 font-oxanium uppercase text-sm font-bold"
            >
              SIGN OUT
            </Button>
          </div>

          {/* Footer Links */}
          <div className="flex justify-between w-full">
            <button
              onClick={handleBillingPortal}
              className="font-oxanium text-[#E9E7E2]/70 uppercase tracking-wider text-sm font-bold hover:text-[#E9E7E2] underline"
            >
              MANAGE BILLING
            </button>

            <button
              onClick={handleResetPassword}
              disabled={isUpdatingPassword}
              className="font-oxanium text-[#E9E7E2]/70 uppercase tracking-wider text-sm font-bold hover:text-[#E9E7E2] underline"
            >
              {isUpdatingPassword ? "SENDING..." : "RESET PASSWORD"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings; 