
import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionCard } from '@/components/profile/SubscriptionCard';

const ProfileSettings: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-[#E9E7E2] p-4">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack} 
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-oxanium text-[#332E38] text-sm uppercase tracking-wider font-bold">
            Profile Settings
          </h1>
        </div>

        {/* User Profile Card */}
        <Card className="w-full bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p>{user?.email}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => signOut()}
              className="w-full text-[#373763] border-[#373763]"
            >
              Sign Out
            </Button>
          </CardFooter>
        </Card>

        {/* Subscription Card */}
        <SubscriptionCard />
      </div>
    </div>
  );
};

export default ProfileSettings;
