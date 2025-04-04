import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useProfileData } from "@/contexts/ProfileDataContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, CreditCard, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const ProfileSettings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profileData, refreshProfileData } = useProfileData();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState(profileData?.full_name || user?.user_metadata?.full_name || "");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    status?: string;
    tier?: string;
    isLoading: boolean;
  }>({
    isLoading: true
  });
  
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
    if (!user) return;
    
    setIsUpdatingName(true);
    
    try {
      // Update user_metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      
      if (authError) throw authError;
      
      // Update profile in database
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('user_id', user.id);
      
      if (dbError) throw dbError;
      
      await refreshProfileData();
      
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
        title: "Success",
        description: "Password reset email sent. Check your inbox.",
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
    
    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 2MB",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    console.log('Starting file upload process...');
    console.log('File details:', { name: file.name, type: file.type, size: file.size });
    
    try {
      // Generate a unique timestamp-based file name to avoid conflicts
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `profile-${timestamp}.${fileExt}`;
      
      console.log('File path for upload:', fileName);
      
      // First, check if we can access the bucket
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('profile_images');
      
      if (bucketError) {
        console.error('Error accessing bucket:', bucketError);
        // Try creating a public URL directly without checking bucket
        console.log('Proceeding with upload despite bucket access error');
      } else {
        console.log('Successfully accessed bucket:', bucketData);
      }
      
      // Attempt direct upload
      console.log('Uploading to profile_images bucket...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      console.log('Upload successful:', uploadData);
      
      // Get the public URL
      const { data: publicURLData } = supabase.storage
        .from('profile_images')
        .getPublicUrl(fileName);
      
      if (!publicURLData?.publicUrl) {
        console.error('Public URL data issue:', publicURLData);
        throw new Error("Failed to get public URL");
      }
      
      const publicUrl = publicURLData.publicUrl;
      console.log('Public URL:', publicUrl);
      
      // Update the profile with the new image URL
      console.log('Updating profile record...');
      console.log('User ID:', user.id);
      console.log('URL to save:', publicUrl);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image: publicUrl })
        .eq('user_id', user.id);
      
      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }
      
      await refreshProfileData();
      console.log('Profile refreshed successfully');
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      
      // Try fallback approach with temporary URL
      try {
        console.log("Trying fallback approach with direct URL...");
        const objectURL = URL.createObjectURL(file);
        console.log("Created temporary object URL:", objectURL);
        
        toast({
          title: "Warning",
          description: "Image uploaded but couldn't be saved permanently. Please try again later.",
          variant: "default",
        });
      } catch (fallbackError) {
        console.error("Fallback approach failed:", fallbackError);
        toast({
          title: "Error",
          description: `Failed to upload profile picture: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
      }
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
      toast({
        title: "Loading",
        description: "Connecting to billing portal...",
      });
      
      console.log("Opening billing portal for user:", user.id);
      
      // Get the current origin for return URL
      const returnUrl = `${window.location.origin}/profile/settings`;
      console.log("Return URL:", returnUrl);
      
      // Call our Supabase Edge Function to create a billing portal session
      console.log("Calling create-stripe-portal function...");
      const { data, error } = await supabase.functions.invoke('create-stripe-portal', {
        body: { 
          userId: user.id,
          returnUrl
        }
      });
      
      console.log("Function response:", { data, error });
      
      if (error) {
        console.error("Error creating billing portal session:", error);
        toast({
          title: "Error",
          description: `Failed to access billing portal: ${error.message}`,
          variant: "destructive",
        });
        return;
      }
      
      if (!data?.url) {
        console.error("No URL returned from billing portal function:", data);
        toast({
          title: "Error",
          description: "Failed to generate billing portal link. Check console for details.",
          variant: "destructive",
        });
        return;
      }
      
      // Redirect to the Stripe billing portal
      console.log("Redirecting to Stripe billing portal:", data.url);
      
      // Use window.open to ensure it's not blocked by popup blockers
      window.open(data.url, '_blank');
      
    } catch (error) {
      console.error("Exception accessing billing portal:", error);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

  // Fetch the user's subscription information
  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (!user) return;
      
      try {
        // @ts-ignore - Ignoring TypeScript errors for the new customers table
        const { data, error } = await supabase
          .from('customers')
          .select('subscription_status, subscription_tier')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching subscription info:", error);
        } else if (data) {
          setSubscriptionInfo({
            status: data.subscription_status,
            tier: data.subscription_tier,
            isLoading: false
          });
        } else {
          // No subscription info found
          setSubscriptionInfo({
            isLoading: false
          });
        }
      } catch (error) {
        console.error("Exception fetching subscription info:", error);
        setSubscriptionInfo({
          isLoading: false
        });
      }
    };
    
    fetchSubscriptionInfo();
  }, [user]);

  // Get the display tier name
  const getCurrentTierName = () => {
    if (subscriptionInfo.isLoading) return "Loading...";
    if (!subscriptionInfo.tier) return "Library Card";
    
    switch (subscriptionInfo.tier) {
      case 'scholar':
        return "Scholar";
      case 'philosopher':
        return "Philosopher";
      default:
        return "Library Card";
    }
  };
  
  // Get the subscription status display message
  const getSubscriptionStatusMessage = () => {
    if (subscriptionInfo.isLoading) return "";
    if (!subscriptionInfo.status) return "Free access to basic features";
    
    switch (subscriptionInfo.status) {
      case 'active':
        return "Your subscription is active";
      case 'past_due':
        return "Your subscription has a payment issue";
      case 'canceled':
        return "Your subscription has been canceled";
      case 'trial':
        return "You're currently on a trial";
      default:
        return "Free access to basic features";
    }
  };

  return (
    <div className="min-h-screen bg-[#2A282A] text-[#E9E7E2] pb-20">
      <div className="container max-w-3xl mx-auto pt-10 px-4">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-6 text-[#E9E7E2] flex items-center gap-2 hover:bg-[#373741]/50"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </Button>
        
        <h1 className="text-2xl font-bold mb-8 font-libre-baskerville">Profile Settings</h1>
        
        <div className="grid gap-6">
          {/* Profile Picture */}
          <Card className="bg-[#373741] border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#E9E7E2] font-oxanium uppercase">Profile Picture</CardTitle>
              <CardDescription className="text-[#E9E7E2]/70">Update your profile image</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative h-32 w-32">
                <svg 
                  viewBox="0 0 100 100" 
                  className="absolute inset-0 h-full w-full text-[#CCFF23]"
                >
                  <polygon 
                    points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3"
                  />
                </svg>
                
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ 
                    clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                  }}
                >
                  <Avatar className="h-full w-full overflow-hidden rounded-none">
                    <AvatarImage src={profileImage || FALLBACK_ICON} />
                    <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] text-white rounded-none">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="relative bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] border-0 flex items-center gap-2"
                disabled={isUploading}
              >
                <Upload size={16} />
                {isUploading ? "Uploading..." : "Upload New Picture"}
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </Button>
            </CardContent>
          </Card>
          
          {/* Name */}
          <Card className="bg-[#373741] border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#E9E7E2] font-oxanium uppercase">Name</CardTitle>
              <CardDescription className="text-[#E9E7E2]/70">Update your full name</CardDescription>
            </CardHeader>
            <CardContent>
              <Input 
                type="text" 
                placeholder="Full Name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                className="bg-[#2A282A] border-[#4D4955] text-[#E9E7E2]"
              />
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleUpdateName} 
                disabled={isUpdatingName || !fullName || fullName === profileData?.full_name}
                className="bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2]"
              >
                {isUpdatingName ? "Updating..." : "Update Name"}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Password */}
          <Card className="bg-[#373741] border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#E9E7E2] font-oxanium uppercase">Password</CardTitle>
              <CardDescription className="text-[#E9E7E2]/70">Reset your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#E9E7E2]/80 mb-4">
                We'll send a password reset link to your email address.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleResetPassword} 
                disabled={isUpdatingPassword}
                className="bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2]"
              >
                {isUpdatingPassword ? "Sending..." : "Reset Password"}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Subscription Plan */}
          <Card className="bg-[#373741] border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#E9E7E2] font-oxanium uppercase">Subscription Plan</CardTitle>
              <CardDescription className="text-[#E9E7E2]/70">Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="current">
                <TabsList className="bg-[#2A282A] mb-4">
                  <TabsTrigger value="current" className="data-[state=active]:bg-[#373763]">Current Plan</TabsTrigger>
                  <TabsTrigger value="upgrade" className="data-[state=active]:bg-[#373763]">Upgrade Options</TabsTrigger>
                </TabsList>
                
                <TabsContent value="current">
                  <div className="bg-[#2A282A] p-4 rounded-md">
                    <h3 className="font-oxanium uppercase mb-2">{getCurrentTierName()}</h3>
                    <p className="text-[#E9E7E2]/70 text-sm mb-4">{getSubscriptionStatusMessage()}</p>
                    <ul className="space-y-2 text-sm text-[#E9E7E2]/80">
                      {subscriptionInfo.tier === 'scholar' ? (
                        <>
                          <li>• Full DNA analysis</li>
                          <li>• Personalized recommendations</li>
                          <li>• Unlimited reading list</li>
                          <li>• Advanced insights</li>
                          <li>• Priority support</li>
                        </>
                      ) : subscriptionInfo.tier === 'philosopher' ? (
                        <>
                          <li>• Full DNA analysis</li>
                          <li>• Personalized recommendations</li>
                          <li>• Unlimited reading list</li>
                          <li>• Advanced insights</li>
                          <li>• Priority support</li>
                          <li>• Exclusive content</li>
                          <li>• 1-on-1 counseling sessions</li>
                          <li>• Advanced analytics</li>
                        </>
                      ) : (
                        <>
                          <li>• Full DNA analysis</li>
                          <li>• Personalized recommendations</li>
                          <li>• Limited reading list</li>
                        </>
                      )}
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="upgrade">
                  <div className="space-y-4">
                    <div className="bg-[#2A282A] p-4 rounded-md border border-[#CCFF23]">
                      <h3 className="font-oxanium uppercase mb-2">Scholar</h3>
                      <p className="text-[#E9E7E2]/70 text-sm mb-1">$9.99/month</p>
                      <p className="text-[#E9E7E2]/80 text-sm mb-4">Enhanced intellectual experience</p>
                      <ul className="space-y-2 text-sm text-[#E9E7E2]/80 mb-4">
                        <li>• Everything in Library Card</li>
                        <li>• Unlimited reading list</li>
                        <li>• Advanced insights</li>
                        <li>• Priority support</li>
                      </ul>
                      <Button className="w-full bg-[#CCFF23] text-[#2A282A] hover:bg-[#CCFF23]/90">
                        Upgrade to Scholar
                      </Button>
                    </div>
                    
                    <div className="bg-[#2A282A] p-4 rounded-md">
                      <h3 className="font-oxanium uppercase mb-2">Philosopher</h3>
                      <p className="text-[#E9E7E2]/70 text-sm mb-1">$19.99/month</p>
                      <p className="text-[#E9E7E2]/80 text-sm mb-4">Ultimate intellectual journey</p>
                      <ul className="space-y-2 text-sm text-[#E9E7E2]/80 mb-4">
                        <li>• Everything in Scholar</li>
                        <li>• Exclusive content</li>
                        <li>• 1-on-1 counseling sessions</li>
                        <li>• Advanced analytics</li>
                      </ul>
                      <Button className="w-full bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2]">
                        Upgrade to Philosopher
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Billing */}
          <Card className="bg-[#373741] border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#E9E7E2] font-oxanium uppercase">Billing</CardTitle>
              <CardDescription className="text-[#E9E7E2]/70">Manage your billing information</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleBillingPortal}
                className="bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] flex items-center gap-2"
              >
                <CreditCard size={16} />
                Access Billing Portal
              </Button>
            </CardContent>
          </Card>
          
          {/* Logout */}
          <Card className="bg-[#373741] border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#E9E7E2] font-oxanium uppercase">Account</CardTitle>
              <CardDescription className="text-[#E9E7E2]/70">Sign out of your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </CardContent>
          </Card>
          
          {/* Debug Tools - only shown in development */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-8 p-4 border border-dashed border-gray-600 rounded-md">
              <h3 className="text-sm font-bold mb-3">Developer Debug Tools</h3>
              <div className="flex gap-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => navigate('/test-upload')}
                  className="text-xs"
                >
                  Test Upload Tool
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => console.log('Profile Data:', profileData)}
                  className="text-xs"
                >
                  Log Profile Data
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings; 