
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

interface UpgradePromptProps {
  variant?: 'default' | 'large' | 'inline';
  showReason?: boolean;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
  variant = 'default',
  showReason = false
}) => {
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    navigate('/upgrade');
  };

  if (variant === 'large') {
    return (
      <div className="rounded-xl p-6 bg-gradient-to-br from-[#373763] to-[#2A2A48] text-white text-center">
        <h3 className="font-oxanium uppercase tracking-wide text-[#CCFF23] mb-2">Upgrade to SURGE</h3>
        <h2 className="font-libre-baskerville text-xl mb-4">Unlimited AI conversations</h2>
        
        {showReason && (
          <p className="text-[#E9E7E2]/80 mb-6 text-sm">
            You've reached your monthly limit of AI conversations with Virgil.
            Upgrade to continue your intellectual journey without limits.
          </p>
        )}
        
        <div className="space-y-4">
          <div className="bg-[#FFFFFF10] rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-oxanium">Monthly</span>
              <span className="font-libre-baskerville font-bold text-xl">$8.99</span>
            </div>
          </div>
          
          <Button 
            onClick={handleUpgradeClick}
            className="w-full py-6 bg-[#CCFF23] hover:bg-[#CCFF23]/90 text-[#373763] rounded-xl font-oxanium uppercase tracking-wider font-bold"
          >
            <Zap className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }
  
  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-between p-3 bg-[#373763]/10 rounded-lg">
        <div className="text-sm text-[#373763] mr-2">
          {showReason 
            ? "You've reached your monthly limit."
            : "Unlimited conversations with Virgil."}
        </div>
        <Button 
          size="sm" 
          onClick={handleUpgradeClick}
          className="bg-[#373763] hover:bg-[#373763]/90 text-white font-oxanium text-xs uppercase tracking-wider"
        >
          <Zap className="h-3 w-3 mr-1" />
          Upgrade
        </Button>
      </div>
    );
  }
  
  // Default variant
  return (
    <Button 
      onClick={handleUpgradeClick}
      className="bg-[#373763] hover:bg-[#373763]/90 text-white font-oxanium text-xs uppercase tracking-wider"
      size="sm"
    >
      <Zap className="h-3 w-3 mr-1" />
      Upgrade to SURGE
    </Button>
  );
};

export default UpgradePrompt;
