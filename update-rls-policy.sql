-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view their own DNA analysis results" ON dna_analysis_results;

-- Drop our previously created flexible policy if it exists
DROP POLICY IF EXISTS "Flexible DNA results access" ON dna_analysis_results;

-- Make DNA analysis results accessible to everyone
-- This simplifies everything by removing access restrictions entirely
CREATE POLICY "Anyone can read DNA results" ON dna_analysis_results
FOR SELECT
USING (true); 