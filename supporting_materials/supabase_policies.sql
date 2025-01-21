CREATE POLICY "Allow public read access to epub_files"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = (SELECT id FROM storage.buckets WHERE name = 'epub_files')
);
