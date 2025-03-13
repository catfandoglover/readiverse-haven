
create table books (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  author text,
  cover_url text,
  epub_file_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a storage bucket for EPUB files
insert into storage.buckets (id, name) values ('epub_files', 'epub_files');

-- Create custom domains table
create table custom_domains (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  user_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create custom domain books table
create table custom_domain_books (
  id uuid default uuid_generate_v4() primary key,
  domain_id uuid not null references custom_domains(id) on delete cascade,
  title text not null,
  author text,
  cover_url text,
  user_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

