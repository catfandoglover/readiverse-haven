
import { Button } from "@/components/ui/button";
import { Dna, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/SupabaseAuthContext";

const SAMPLE_ANSWERS = {
  "ETHICS": "ABAAA",
  "ONTOLOGY": "BBABA",
  "POLITICS": "BAAAA",
  "THEOLOGY": "ABAAB",
  "AESTHETICS": "ABAAB",
  "EPISTEMOLOGY": "AABBA"
};

export function AnalyzeDNAButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleAnalyzeDNA = async () => {
    try {
      setIsLoading(true);
      toast.info('Starting DNA analysis...');
      
      // First, create an assessment result record to store the analysis
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('dna_assessment_results')
        .insert({
          name: 'Quick Analysis',
          answers: SAMPLE_ANSWERS,
          profile_id: user?.id || null
        })
        .select('id')
        .single();

      if (assessmentError) {
        console.error('Error creating assessment record:', assessmentError);
        toast.error('Failed to initialize DNA analysis');
        throw assessmentError;
      }
      
      const assessment_id = assessmentData.id;
      console.log('Created assessment record:', assessment_id);

      // Now call the edge function to analyze the DNA
      const { data, error } = await supabase.functions.invoke('analyze-dna', {
        body: {
          answers_json: SAMPLE_ANSWERS,
          assessment_id,
          profile_id: user?.id || null
        }
      });

      if (error) {
        console.error('Error from Edge Function:', error);
        toast.error('Failed to analyze DNA: ' + error.message);
        throw error;
      }
      
      console.log('Analysis response:', data);
      
      // Add a small delay to ensure the analysis is stored
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // After the analysis is complete, validate the entities
      console.log('DNA analysis complete, validating entities with assessment ID:', assessment_id);
      
      const { data: validationData, error: validationError } = await supabase.functions.invoke('validate-dna-entities', {
        body: {
          assessment_id
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
      toast.error('Failed to analyze DNA: ' + (error.message || 'Unknown error'));
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
