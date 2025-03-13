
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

-- Create custom domains table with uuid user_id
create table custom_domains (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  user_id uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster lookups
create index custom_domains_user_id_idx on custom_domains(user_id);

-- Create custom domain books table with uuid user_id
create table custom_domain_books (
  id uuid default uuid_generate_v4() primary key,
  domain_id uuid not null references custom_domains(id) on delete cascade,
  title text not null,
  author text,
  cover_url text,
  user_id uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Prevent duplicate books in the same domain
  unique(domain_id, title, author)
);

-- Create indexes for faster lookups
create index custom_domain_books_domain_id_idx on custom_domain_books(domain_id);
create index custom_domain_books_user_id_idx on custom_domain_books(user_id);

-- Create user books table for the user's library
create table user_books (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  book_id uuid not null references books(id) on delete cascade,
  is_favorite boolean default false,
  reading_progress float default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, book_id)
);

-- Create Row Level Security (RLS) policies
alter table custom_domains enable row level security;
create policy "Users can create their own domains"
  on custom_domains for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own domains"
  on custom_domains for select
  using (auth.uid() = user_id);

create policy "Users can update their own domains"
  on custom_domains for update
  using (auth.uid() = user_id);

create policy "Users can delete their own domains"
  on custom_domains for delete
  using (auth.uid() = user_id);

-- RLS for custom_domain_books
alter table custom_domain_books enable row level security;
create policy "Users can create books in their domains"
  on custom_domain_books for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from custom_domains
      where id = domain_id and user_id = auth.uid()
    )
  );

create policy "Users can view books in their domains"
  on custom_domain_books for select
  using (
    auth.uid() = user_id or
    exists (
      select 1 from custom_domains
      where id = domain_id and user_id = auth.uid()
    )
  );

create policy "Users can update books in their domains"
  on custom_domain_books for update
  using (
    auth.uid() = user_id and
    exists (
      select 1 from custom_domains
      where id = domain_id and user_id = auth.uid()
    )
  );

create policy "Users can delete books in their domains"
  on custom_domain_books for delete
  using (
    auth.uid() = user_id and
    exists (
      select 1 from custom_domains
      where id = domain_id and user_id = auth.uid()
    )
  );

