
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
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  showBackButton = true,
  fullHeight = true,
  verticalCenter = true
}) => {
  const navigate = useNavigate();

  return (
    <div 
      className={`bg-[#E9E7E2] ${fullHeight ? 'min-h-screen' : ''} ${
        verticalCenter ? 'flex flex-col items-center justify-center' : ''
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

      <div className="max-w-md w-full mx-auto">
        <h1 className="font-libre-baskerville font-bold text-[#373763] text-3xl md:text-4xl text-center mb-4">
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-[#332E38]/70 text-center mb-8">
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
