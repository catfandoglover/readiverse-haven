
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/SupabaseAuthContext';

interface TokenUsageData {
  tokensUsed: number;
  tokenLimit: number;
  percentUsed: number;
  hasAvailableTokens: boolean;
  isSubscriber: boolean;
}

const TokenUsageDisplay: React.FC = () => {
  const [usageData, setUsageData] = useState<TokenUsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTokenUsage = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('get-token-usage');

        if (error) {
          setError('Failed to load usage data');
          console.error('Error fetching token usage:', error);
        } else {
          setUsageData(data);
        }
      } catch (err) {
        console.error('Exception fetching token usage:', err);
        setError('Failed to load usage data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenUsage();
  }, [user]);

  if (!user || isLoading) {
    return <div className="h-2 animate-pulse bg-gray-300 rounded-full"></div>;
  }

  if (error) {
    return null; // Don't show anything if there's an error
  }

  if (!usageData) {
    return null;
  }

  // If user is a subscriber, don't show usage
  if (usageData.isSubscriber) {
    return null;
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-[#332E38]/70">
        <span>Usage</span>
        <span>{usageData.percentUsed}%</span>
      </div>
      <Progress value={usageData.percentUsed} className="h-2" />
      <p className="text-xs text-[#332E38]/70 mt-1">
        {usageData.percentUsed >= 90 
          ? "You're almost out of tokens for this month"
          : "Monthly token limit"}
      </p>
    </div>
  );
};

export default TokenUsageDisplay;
