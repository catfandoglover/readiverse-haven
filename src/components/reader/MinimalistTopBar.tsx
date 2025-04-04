
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface MinimalistTopBarProps {
  title: string;
  externalLink: string | null;
  showControls: boolean;
}

const MinimalistTopBar: React.FC<MinimalistTopBarProps> = ({ 
  title, 
  externalLink,
  showControls
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (externalLink) {
      window.open(externalLink, '_blank');
    } else {
      navigate('/bookshelf');
    }
  };

  return (
    <div 
      className={`flex items-center justify-between p-4 text-white transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        className="text-white hover:bg-white/10"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      
      <h1 className="text-md font-medium truncate max-w-[70%]">{title}</h1>
      
      <div className="w-10" />
    </div>
  );
};

export default MinimalistTopBar;
