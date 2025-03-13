
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
