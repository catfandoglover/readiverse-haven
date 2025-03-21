
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface SchedulingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SchedulingModal: React.FC<SchedulingModalProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const scriptLoaded = useRef(false);
  const initialized = useRef(false);

  useEffect(() => {
    // Only load the script once
    if (!scriptLoaded.current && open) {
      const script = document.createElement('script');
      script.src = 'https://asset-tidycal.b-cdn.net/js/embed.js';
      script.async = true;
      script.onload = () => {
        console.log("TidyCal script loaded");
        initialized.current = true;
      };
      document.body.appendChild(script);
      scriptLoaded.current = true;
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Redirect to discover when modal is closed
      navigate('/discover');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[900px] md:max-w-[1000px] w-[90%] max-h-[90vh] overflow-y-auto">
        <div className="tidycal-embed h-[70vh]" data-path="team/intellectual-genetic-counselors/intake"></div>
      </DialogContent>
    </Dialog>
  );
};

export default SchedulingModal;
