
CREATE POLICY "Allow public read access to epub_files"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = (SELECT id FROM storage.buckets WHERE name = 'epub_files')
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public;
REVOKE USAGE ON SCHEMA public FROM anon;

-- Enable Row Level Security for DNA assessment tables
ALTER TABLE dna_assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE dna_analysis_results ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own DNA assessment results
CREATE POLICY "Users can view their own DNA assessment results"
ON dna_assessment_results
FOR SELECT
USING (
  profile_id = auth.uid() OR
  profile_id IN (
    SELECT id FROM profiles WHERE outseta_user_id = auth.uid()
  )
);

-- Allow users to view their own DNA analysis results
CREATE POLICY "Users can view their own DNA analysis results"
ON dna_analysis_results
FOR SELECT
USING (
  assessment_id IN (
    SELECT id FROM dna_assessment_results 
    WHERE profile_id = auth.uid() OR
    profile_id IN (
      SELECT id FROM profiles WHERE outseta_user_id = auth.uid()
    )
  )
);
