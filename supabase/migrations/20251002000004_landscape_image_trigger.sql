-- Create function to fuzzy match and update landscape image for profiles when DNA analysis is added
CREATE OR REPLACE FUNCTION public.match_landscape_image_for_archetype()
RETURNS TRIGGER AS $$
DECLARE
  archetype_name TEXT;
  matching_landscape_image TEXT;
  user_id UUID;
  profile_id TEXT;
  archetype_count INTEGER;
BEGIN
  -- Get the archetype from the new DNA analysis result
  archetype_name := NEW.archetype;
  
  -- Verbose logging
  RAISE NOTICE '[LandscapeTrigger] Trigger called for DNA Result ID: %, Assessment ID: %, Archetype: %', NEW.id, NEW.assessment_id, archetype_name;
  
  -- Skip if archetype is null
  IF archetype_name IS NULL THEN
    RAISE NOTICE '[LandscapeTrigger] Archetype is NULL, skipping';
    RETURN NEW;
  END IF;
  
  -- Find profile related to this DNA analysis
  SELECT p.id, p.user_id INTO profile_id, user_id 
  FROM profiles p 
  WHERE p.assessment_id = NEW.id OR p.assessment_id = NEW.assessment_id
  LIMIT 1;
  
  -- Verbose logging for profile lookup
  IF profile_id IS NULL THEN
    RAISE NOTICE '[LandscapeTrigger] No profile found related to DNA analysis ID % or assessment ID %', NEW.id, NEW.assessment_id;
    RETURN NEW;
  ELSE
    RAISE NOTICE '[LandscapeTrigger] Found profile ID: % for user ID: %', profile_id, user_id;
  END IF;
  
  -- Check if archetypes table has data (optional, but good for debugging)
  -- SELECT COUNT(*) INTO archetype_count FROM archetypes;
  -- RAISE NOTICE '[LandscapeTrigger] Found % archetypes in the database', archetype_count;
  
  -- Look for exact match in archetypes table first
  SELECT landscape_image INTO matching_landscape_image
  FROM archetypes
  WHERE LOWER(archetype) = LOWER(archetype_name)
  LIMIT 1;
  
  RAISE NOTICE '[LandscapeTrigger] Exact match result: %', matching_landscape_image;
  
  -- If no exact match, try fuzzy matching using similarity
  IF matching_landscape_image IS NULL THEN
    RAISE NOTICE '[LandscapeTrigger] No exact match found, trying fuzzy match for: %', archetype_name;
    
    SELECT landscape_image -- Removed sim_score selection as it's not used directly
    INTO matching_landscape_image
    FROM archetypes
    WHERE archetype IS NOT NULL
    ORDER BY similarity(LOWER(archetype), LOWER(archetype_name)) DESC
    LIMIT 1;
    
    RAISE NOTICE '[LandscapeTrigger] Fuzzy match result: %', matching_landscape_image;
  END IF;
  
  -- If no match found after fuzzy search, assign the default
  IF matching_landscape_image IS NULL THEN
    RAISE NOTICE '[LandscapeTrigger] No matching landscape found for archetype "%", assigning default.', archetype_name;
    matching_landscape_image := 'https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/landscape_images/Default_Landscape.jpg';
  END IF;

  -- Update the profile with the determined landscape image (matched or default)
  UPDATE profiles
  SET landscape_image = matching_landscape_image, updated_at = now()
  WHERE id = profile_id;
  
  RAISE NOTICE '[LandscapeTrigger] Updated profile ID % with landscape image: %', profile_id, matching_landscape_image;

  -- Removed the old contradictory update block inside the previous IF
  -- Removed the seeding logic inside the IF archetype_count = 0 block
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist (keep this)
DROP TRIGGER IF EXISTS on_dna_analysis_results_inserted ON dna_analysis_results;
DROP TRIGGER IF EXISTS on_dna_analysis_results_updated ON dna_analysis_results;

-- Create trigger to match landscape images on DNA analysis results insertion (keep this)
CREATE TRIGGER on_dna_analysis_results_inserted
  AFTER INSERT ON dna_analysis_results
  FOR EACH ROW EXECUTE FUNCTION public.match_landscape_image_for_archetype();
  
-- Add trigger for updates to DNA analysis results too (keep this)
CREATE TRIGGER on_dna_analysis_results_updated
  AFTER UPDATE OF archetype ON dna_analysis_results
  FOR EACH ROW
  WHEN (OLD.archetype IS DISTINCT FROM NEW.archetype)
  EXECUTE FUNCTION public.match_landscape_image_for_archetype();

-- Create extension for similarity matching if it doesn't exist
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Run the function for all existing DNA analysis results
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE 'Running landscape matcher for existing DNA analysis results';
  FOR r IN SELECT * FROM dna_analysis_results WHERE archetype IS NOT NULL LOOP
    PERFORM match_landscape_image_for_archetype();
  END LOOP;
END $$; 