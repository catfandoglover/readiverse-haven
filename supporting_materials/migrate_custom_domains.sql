
-- Create books table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS books (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  author text,
  cover_url text,
  epub_file_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a storage bucket for EPUB files if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name) 
  VALUES ('epub_files', 'epub_files')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Create custom domains table with uuid user_id
CREATE TABLE IF NOT EXISTS custom_domains (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS custom_domains_user_id_idx ON custom_domains(user_id);

-- Create custom domain books table with uuid user_id
CREATE TABLE IF NOT EXISTS custom_domain_books (
  id uuid default uuid_generate_v4() primary key,
  domain_id uuid not null references custom_domains(id) on delete cascade,
  title text not null,
  author text,
  cover_url text,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Prevent duplicate books in the same domain
  UNIQUE(domain_id, title, author)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS custom_domain_books_domain_id_idx ON custom_domain_books(domain_id);
CREATE INDEX IF NOT EXISTS custom_domain_books_user_id_idx ON custom_domain_books(user_id);

-- Create user books table for the user's library if it doesn't exist
CREATE TABLE IF NOT EXISTS user_books (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  book_id uuid not null references books(id) on delete cascade,
  is_favorite boolean default false,
  reading_progress float default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  UNIQUE(user_id, book_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_domain_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if present to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own domains" ON custom_domains;
DROP POLICY IF EXISTS "Users can view their own domains" ON custom_domains;
DROP POLICY IF EXISTS "Users can update their own domains" ON custom_domains;
DROP POLICY IF EXISTS "Users can delete their own domains" ON custom_domains;

DROP POLICY IF EXISTS "Users can create books in their domains" ON custom_domain_books;
DROP POLICY IF EXISTS "Users can view books in their domains" ON custom_domain_books;
DROP POLICY IF EXISTS "Users can update books in their domains" ON custom_domain_books;
DROP POLICY IF EXISTS "Users can delete books in their domains" ON custom_domain_books;

-- Create RLS policies for custom_domains
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

-- Create RLS policies for custom_domain_books
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

-- Create storage policy to allow public read access to epub files
CREATE POLICY IF NOT EXISTS "Allow public read access to epub_files"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = (SELECT id FROM storage.buckets WHERE name = 'epub_files')
);
