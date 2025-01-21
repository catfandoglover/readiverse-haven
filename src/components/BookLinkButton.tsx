import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface BookLinkButtonProps {
  bookSlug: string;
  children: React.ReactNode;
  className?: string;
}

const BookLinkButton = ({ bookSlug, children, className }: BookLinkButtonProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/${bookSlug}`);
  };

  return (
    <Button 
      onClick={handleClick}
      className={className}
    >
      {children}
    </Button>
  );
};

export default BookLinkButton;