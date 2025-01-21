CREATE POLICY "Allow public read access to epub_files"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = (SELECT id FROM storage.buckets WHERE name = 'epub_files')
);

-- a. Revoke existing privileges from the public role:
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public;
REVOKE USAGE ON SCHEMA public FROM anon;
