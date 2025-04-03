-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own DNA analysis results" ON dna_analysis_results;

-- Create a simple open access policy
CREATE POLICY "Anyone can read DNA results" ON dna_analysis_results
FOR SELECT
USING (true); 