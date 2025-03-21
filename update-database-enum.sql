-- SQL Script to update the dna_category enum to include PRIMING value

-- First, alter the enum type to add the new value
ALTER TYPE public.dna_category ADD VALUE IF NOT EXISTS 'PRIMING';

-- Note: This script needs to be run with appropriate permissions
-- Execute this in the Supabase SQL Editor or using the Supabase CLI

-- Example command using Supabase CLI:
-- supabase db query --file update-database-enum.sql 
