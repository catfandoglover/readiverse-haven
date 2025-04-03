-- First ensure the archetypes table exists and has data
CREATE TABLE IF NOT EXISTS archetypes (
  id SERIAL PRIMARY KEY,
  archetype TEXT,
  landscape_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert sample archetypes if the table is empty
INSERT INTO archetypes (archetype, landscape_image)
SELECT 
  unnest(ARRAY[
    'Pragmatic Integrator', 
    'Twilight Navigator', 
    'Noble Knight', 
    'Cosmic Mystic',
    'Stoic Strategist',
    'Empathic Guide',
    'Dynamic Synthesizer',
    'Rational Skeptic',
    'Illuminated Seeker'
  ]), 
  unnest(ARRAY[
    'https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/landscape_images/Pragmatic_Integrator.jpg',
    'https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/landscape_images/Twilight_Navigator.png',
    'https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/landscape_images/Noble_Knight.jpg',
    'https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/landscape_images/Cosmic_Mystic.jpg',
    'https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/landscape_images/Stoic_Strategist.jpg',
    'https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/landscape_images/Empathic_Guide.jpg',
    'https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/landscape_images/Dynamic_Synthesizer.jpg',
    'https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/landscape_images/Rational_Skeptic.jpg',
    'https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/landscape_images/Illuminated_Seeker.jpg'
  ])
WHERE NOT EXISTS (SELECT 1 FROM archetypes LIMIT 1);

-- Ensure the pg_trgm extension is installed for similarity matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- For each profile with an assessment_id but no landscape_image, find the matching archetype 
-- and update the landscape_image field
DO $$
DECLARE
  profile_record RECORD;
  dna_result RECORD;
  matching_landscape TEXT;
BEGIN
  FOR profile_record IN 
    SELECT p.* 
    FROM profiles p 
    LEFT JOIN (
      SELECT id, assessment_id 
      FROM dna_analysis_results 
      WHERE archetype IS NOT NULL
    ) d ON p.assessment_id = d.id OR p.assessment_id = d.assessment_id
    WHERE 
      p.assessment_id IS NOT NULL 
      AND (p.landscape_image IS NULL OR p.landscape_image = '')
  LOOP
    -- Get DNA analysis result linked to this profile
    SELECT * INTO dna_result 
    FROM dna_analysis_results 
    WHERE id = profile_record.assessment_id OR assessment_id = profile_record.assessment_id
    LIMIT 1;
    
    IF dna_result.archetype IS NOT NULL THEN
      RAISE NOTICE 'Processing profile ID % with archetype %', profile_record.id, dna_result.archetype;
      
      -- Try exact match first
      SELECT landscape_image INTO matching_landscape
      FROM archetypes
      WHERE LOWER(archetype) = LOWER(dna_result.archetype)
      LIMIT 1;
      
      -- If no exact match, use fuzzy matching
      IF matching_landscape IS NULL THEN
        SELECT landscape_image INTO matching_landscape
        FROM archetypes
        WHERE archetype IS NOT NULL
        ORDER BY similarity(LOWER(archetype), LOWER(dna_result.archetype)) DESC
        LIMIT 1;
      END IF;
      
      -- Update the profile with the matched landscape image
      IF matching_landscape IS NOT NULL THEN
        UPDATE profiles
        SET landscape_image = matching_landscape,
            updated_at = now()
        WHERE id = profile_record.id;
        
        RAISE NOTICE 'Updated profile ID % with landscape image %', profile_record.id, matching_landscape;
      ELSE
        -- Use default landscape if no match found
        UPDATE profiles
        SET landscape_image = 'https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/landscape_images/Default_Landscape.jpg',
            updated_at = now()
        WHERE id = profile_record.id;
        
        RAISE NOTICE 'No matching landscape found for archetype %, using default', dna_result.archetype;
      END IF;
    END IF;
  END LOOP;
END $$;

-- Create the trigger function for future inserts/updates
CREATE OR REPLACE FUNCTION public.match_landscape_image_for_archetype()
RETURNS TRIGGER AS $$
DECLARE
  archetype_name TEXT;
  matching_landscape_image TEXT;
  profile_id TEXT;
BEGIN
  -- Get the archetype from the new DNA analysis result
  archetype_name := NEW.archetype;
  
  -- Skip if archetype is null
  IF archetype_name IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Find profile related to this DNA analysis
  SELECT p.id INTO profile_id 
  FROM profiles p 
  WHERE p.assessment_id = NEW.id OR p.assessment_id = NEW.assessment_id
  LIMIT 1;
  
  -- Skip if we couldn't find a related profile
  IF profile_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Look for exact match in archetypes table first
  SELECT landscape_image INTO matching_landscape_image
  FROM archetypes
  WHERE LOWER(archetype) = LOWER(archetype_name)
  LIMIT 1;
  
  -- If no exact match, try fuzzy matching using similarity
  IF matching_landscape_image IS NULL THEN
    SELECT landscape_image INTO matching_landscape_image
    FROM archetypes
    WHERE archetype IS NOT NULL
    ORDER BY similarity(LOWER(archetype), LOWER(archetype_name)) DESC
    LIMIT 1;
  END IF;
  
  -- If we found a matching landscape image, update the profile
  IF matching_landscape_image IS NOT NULL THEN
    UPDATE profiles
    SET landscape_image = matching_landscape_image, updated_at = now()
    WHERE id = profile_id;
  ELSE
    -- Default fallback to a general landscape image if no match found
    UPDATE profiles
    SET landscape_image = 'https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/landscape_images/Default_Landscape.jpg', updated_at = now()
    WHERE id = profile_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_dna_analysis_results_inserted ON dna_analysis_results;
DROP TRIGGER IF EXISTS on_dna_analysis_results_updated ON dna_analysis_results;

-- Create trigger to match landscape images on DNA analysis results insertion
CREATE TRIGGER on_dna_analysis_results_inserted
  AFTER INSERT ON dna_analysis_results
  FOR EACH ROW EXECUTE FUNCTION public.match_landscape_image_for_archetype();
  
-- Add trigger for updates to DNA analysis results too (in case archetype changes)
CREATE TRIGGER on_dna_analysis_results_updated
  AFTER UPDATE OF archetype ON dna_analysis_results
  FOR EACH ROW
  WHEN (OLD.archetype IS DISTINCT FROM NEW.archetype)
  EXECUTE FUNCTION public.match_landscape_image_for_archetype(); 