CREATE POLICY "Allow public read access to epub_files"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = (SELECT id FROM storage.buckets WHERE name = 'epub_files')
);

-- Revoke existing privileges from the public role
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public;
REVOKE USAGE ON SCHEMA public FROM anon;

-- Add RLS policies for custom_domains
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create their own domains"
  ON custom_domains FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own domains"
  ON custom_domains FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own domains"
  ON custom_domains FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own domains"
  ON custom_domains FOR DELETE
  USING (auth.uid() = user_id);

-- Add RLS policies for custom_domain_books
ALTER TABLE custom_domain_books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create books in their domains"
  ON custom_domain_books FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM custom_domains
      WHERE id = domain_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can view books in their domains"
  ON custom_domain_books FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM custom_domains
      WHERE id = domain_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update books in their domains"
  ON custom_domain_books FOR UPDATE
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM custom_domains
      WHERE id = domain_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete books in their domains"
  ON custom_domain_books FOR DELETE
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM custom_domains
      WHERE id = domain_id AND user_id = auth.uid()
    )
  );

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