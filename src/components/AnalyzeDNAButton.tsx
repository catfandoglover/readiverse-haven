
import { Button } from "@/components/ui/button";
import { Dna, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/OutsetaAuthContext";

const SAMPLE_ANSWERS = {
  "ETHICS": "ABABA",
  "ONTOLOGY": "BBABA",
  "POLITICS": "BAABB",
  "THEOLOGY": "ABAAB",
  "AESTHETICS": "AABAB",
  "EPISTEMOLOGY": "BABBA"
};

export function AnalyzeDNAButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, supabase: supabaseClient } = useAuth();

  const handleAnalyzeDNA = async () => {
    try {
      setIsLoading(true);
      toast.info('Starting DNA analysis...');
      
      // First, create an assessment result record to store the analysis
      let assessment_id;
      
      if (supabaseClient) {
        const { data: assessmentData, error: assessmentError } = await supabaseClient
          .from('dna_assessment_results')
          .insert({
            name: 'Quick Analysis',
            answers: SAMPLE_ANSWERS,
            profile_id: user?.Uid ? user.Uid : null
          })
          .select('id')
          .single();

        if (assessmentError) {
          console.error('Error creating assessment record:', assessmentError);
          toast.error('Failed to initialize DNA analysis');
          throw assessmentError;
        }
        
        assessment_id = assessmentData.id;
        console.log('Created assessment record:', assessment_id);
      } else {
        console.log('No authenticated user, creating anonymous assessment');
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('dna_assessment_results')
          .insert({
            name: 'Anonymous Analysis',
            answers: SAMPLE_ANSWERS
          })
          .select('id')
          .single();

        if (assessmentError) {
          console.error('Error creating assessment record:', assessmentError);
          toast.error('Failed to initialize DNA analysis');
          throw assessmentError;
        }
        
        assessment_id = assessmentData.id;
        console.log('Created anonymous assessment record:', assessment_id);
      }

      // Now call the edge function to analyze the DNA
      const { data, error } = await supabase.functions.invoke('analyze-dna', {
        method: 'POST',
        body: {
          answers_json: SAMPLE_ANSWERS,
          assessment_id,
          profile_id: user?.Uid || null
        }
      });

      if (error) {
        console.error('Error from Edge Function:', error);
        toast.error('Failed to analyze DNA');
        throw error;
      }
      
      // After the analysis is complete, validate the entities
      console.log('DNA analysis complete, validating entities with assessment ID:', assessment_id);
      
      const { data: validationData, error: validationError } = await supabase.functions.invoke('validate-dna-entities', {
        method: 'POST',
        body: {
          assessmentId: assessment_id
        }
      });
      
      if (validationError) {
        console.error('Error validating DNA entities:', validationError);
        // Don't fail the whole process for validation errors
        toast.warning('DNA analysis complete, but entity validation had issues');
      } else {
        console.log('Entity validation results:', validationData);
        toast.success('Successfully analyzed DNA with entity validation');
      }
      
    } catch (error) {
      console.error('Error triggering DNA analysis:', error);
      toast.error('Failed to analyze DNA');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleAnalyzeDNA}
      disabled={isLoading}
      variant="outline"
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Dna className="h-4 w-4" />
      )}
      Analyze DNA
    </Button>
  );
}
