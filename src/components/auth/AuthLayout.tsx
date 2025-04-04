
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  fullHeight?: boolean;
  verticalCenter?: boolean;
  showLightningLogo?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  showBackButton = true,
  fullHeight = true,
  verticalCenter = true,
  showLightningLogo = false
}) => {
  const navigate = useNavigate();

  return (
    <div 
      className={`bg-[#E9E7E2] ${fullHeight ? 'min-h-screen' : ''} ${
        verticalCenter ? 'flex flex-col items-center justify-center' : 'flex flex-col'
      } p-6`}
    >
      {showBackButton && (
        <div className="absolute top-6 left-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-[#373763] hover:bg-[#373763]/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="max-w-md w-full mx-auto flex flex-col h-full py-12">
        {showLightningLogo && (
          <div className="flex justify-center mb-8">
            <img 
              src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Lightning%20Hexagon.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL0xpZ2h0bmluZyBIZXhhZ29uLnBuZyIsImlhdCI6MTc0MzczODUzMiwiZXhwIjo4ODE0MzY1MjEzMn0.nqjOMHSqPwcszVHj-OUBxUHDP1OEMBkkg8GceJiY0TY"
              alt="Lightning Logo"
              className="w-32 h-32 object-contain"
            />
          </div>
        )}

        <h1 className="font-libre-baskerville font-bold text-[#373763] text-3xl md:text-4xl text-center mb-4">
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-[#373763] text-center mb-8 font-oxanium uppercase text-sm tracking-wider">
            {subtitle}
          </p>
        )}

        <div className="flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
