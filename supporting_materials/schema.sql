
create table books (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  author text,
  author_id uuid references icons(id),
  cover_url text,
  epub_file_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index on author_id for faster lookups
create index if not exists idx_books_author_id on books(author_id);

-- Create a storage bucket for EPUB files
insert into storage.buckets (id, name) values ('epub_files', 'epub_files');

-- Add profile_id column to dna_assessment_results
alter table if exists dna_assessment_results 
add column if not exists profile_id uuid references profiles(id);

-- Create index for faster lookups
create index if not exists idx_dna_assessment_profile 
on dna_assessment_results(profile_id);

-- Add RLS policy for dna_assessment_results
create policy "Users can view their own DNA assessment results"
on dna_assessment_results
for select
using (
  profile_id = auth.uid() or 
  profile_id in (
    select id from profiles where outseta_user_id = auth.uid()
  )
);

-- Add RLS policy for DNA analysis results
create policy "Users can view their own DNA analysis results"
on dna_analysis_results
for select
using (
  assessment_id in (
    select id from dna_assessment_results 
    where profile_id = auth.uid() or
    profile_id in (
      select id from profiles where outseta_user_id = auth.uid()
    )
  )
);
