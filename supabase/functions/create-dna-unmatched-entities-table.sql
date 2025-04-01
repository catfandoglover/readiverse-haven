
-- SQL script to create the dna_unmatched_entities table
-- This will be run manually through the Supabase SQL editor

-- Create the table for tracking unmatched entities
CREATE TABLE IF NOT EXISTS public.dna_unmatched_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES public.dna_analysis_results(id),
  unmatched_thinkers JSONB DEFAULT '[]'::jsonb,
  unmatched_classics JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add a comment to the table
COMMENT ON TABLE public.dna_unmatched_entities IS 'Stores information about entities in DNA analysis that could not be matched with high confidence to database records';

-- Enable Row Level Security
ALTER TABLE public.dna_unmatched_entities ENABLE ROW LEVEL SECURITY;

-- Create policy for administrative access
CREATE POLICY "Administrators can access all unmatched entities" 
  ON public.dna_unmatched_entities 
  FOR ALL
  TO authenticated
  USING (true);

-- Add a trigger to automatically update the updated_at column
CREATE TRIGGER update_dna_unmatched_entities_updated_at
  BEFORE UPDATE ON public.dna_unmatched_entities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
