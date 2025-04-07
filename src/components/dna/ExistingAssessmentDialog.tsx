import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ExistingAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingAssessmentId: string;
  pendingAssessmentId: string;
}

const ExistingAssessmentDialog: React.FC<ExistingAssessmentDialogProps> = ({
  open,
  onOpenChange,
  existingAssessmentId,
  pendingAssessmentId,
}) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    onOpenChange(false);
    // Clear pending assessment IDs
    localStorage.removeItem('pending_dna_assessment_id');
    sessionStorage.removeItem('dna_assessment_to_save');
    
    // Navigate to profile
    navigate('/profile');
  };

  const handleReplaceAssessment = async () => {
    try {
      // Get the user's profile
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast.error("User authentication error");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userData.user.id)
        .maybeSingle();
        
      if (profileError || !profileData) {
        console.error('Error fetching profile:', profileError);
        toast.error("Error updating your profile");
        return;
      }
      
      // Update the profile with the new assessment ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ assessment_id: pendingAssessmentId })
        .eq('id', profileData.id);
        
      if (updateError) {
        console.error('Error updating profile with assessment ID:', updateError);
        toast.error('Failed to update your assessment results.');
        return;
      }
      
      // Success! Clear the pending ID from storage
      localStorage.removeItem('pending_dna_assessment_id');
      sessionStorage.removeItem('dna_assessment_to_save');
      toast.success('Your assessment results have been updated!');
      
      // Close dialog
      onOpenChange(false);
      
      // Navigate to welcome screen to view new results
      navigate('/dna/welcome');
    } catch (error) {
      console.error('Error replacing assessment:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#E9E7E2] text-[#373763] max-w-md">
        <DialogHeader>
          <DialogTitle className="font-libre-baskerville text-2xl font-bold">
            You already have a DNA assessment
          </DialogTitle>
          <DialogDescription className="font-oxanium mt-4 text-[#373763]/80">
            You already have a completed DNA assessment. Taking you to your existing profile.
          </DialogDescription>
        </DialogHeader>
        
      </DialogContent>
    </Dialog>
  );
};

export default ExistingAssessmentDialog; 
