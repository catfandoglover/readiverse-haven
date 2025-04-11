-- Retroactively add books from dna_analysis_results_matched to Intellectual DNA bookshelf and user_books table
-- This script:
-- 1. Identifies book entries in dna_analysis_results_matched
-- 2. Extracts domain and type (kindred_spirit vs challenging_voice) from field_name
-- 3. Adds books to user's Intellectual DNA bookshelf under respective domain
-- 4. Also adds these books to user_books table if not already there

-- First, let's insert into user_books for any books that appear in dna_analysis_results_matched
-- but aren't already in user_books
INSERT INTO user_books (user_id, book_id, created_at, updated_at)
SELECT 
    dar.user_id,
    darm.matched_id AS book_id,
    NOW() AS created_at,
    NOW() AS updated_at
FROM 
    dna_analysis_results dar
JOIN 
    dna_analysis_results_matched darm ON dar.assessment_id = darm.assessment_id
JOIN 
    books b ON darm.matched_id = b.id
LEFT JOIN 
    user_books ub ON dar.user_id = ub.user_id AND darm.matched_id = ub.book_id
WHERE 
    -- Only include entries where matched_id is a book
    darm.matched_id IN (SELECT id FROM books)
    -- Only include books not already in user_books
    AND ub.id IS NULL;

-- Now, let's create a function to extract domain from field_name
CREATE OR REPLACE FUNCTION extract_domain_from_field_name(field_name TEXT)
RETURNS TEXT AS $$
DECLARE
    domain TEXT;
BEGIN
    -- Assuming field names are in format like 'ethics_kindred_spirit_1_classic'
    domain := SPLIT_PART(field_name, '_', 1);
    RETURN domain;
END;
$$ LANGUAGE plpgsql;

-- Create a function to extract type (kindred vs challenging) from field_name
CREATE OR REPLACE FUNCTION extract_type_from_field_name(field_name TEXT)
RETURNS TEXT AS $$
DECLARE
    type_part TEXT;
BEGIN
    -- Check if this is a kindred_spirit or challenging_voice entry
    IF field_name LIKE '%kindred_spirit%' THEN
        RETURN 'kindred';
    ELSIF field_name LIKE '%challenging_voice%' THEN
        RETURN 'challenging';
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function to extract position (1-5) from field_name
CREATE OR REPLACE FUNCTION extract_position_from_field_name(field_name TEXT)
RETURNS INTEGER AS $$
DECLARE
    position_part TEXT;
    position_num INTEGER;
BEGIN
    -- Try to extract the number part from naming patterns like:
    -- ethics_kindred_spirit_1_classic or ethics_challenging_voice_2_classic
    
    -- For kindred_spirit
    IF field_name LIKE '%kindred_spirit%' THEN
        position_part := SPLIT_PART(field_name, 'kindred_spirit_', 2);
        position_part := SPLIT_PART(position_part, '_', 1);
    -- For challenging_voice
    ELSIF field_name LIKE '%challenging_voice%' THEN
        position_part := SPLIT_PART(field_name, 'challenging_voice_', 2);
        position_part := SPLIT_PART(position_part, '_', 1);
    ELSE
        RETURN NULL;
    END IF;
    
    -- Convert to integer, default to NULL if conversion fails
    BEGIN
        position_num := position_part::INTEGER;
        RETURN position_num;
    EXCEPTION WHEN OTHERS THEN
        RETURN NULL;
    END;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the intellectual_dna_shelf table if it doesn't exist
-- Note: Modify this as needed based on your actual schema
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'intellectual_dna_shelf') THEN
        CREATE TABLE intellectual_dna_shelf (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            domain TEXT NOT NULL,
            type TEXT NOT NULL,
            position INTEGER NOT NULL,
            book_id UUID REFERENCES books(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, domain, type, position)
        );
    END IF;
END
$$;

-- Now, populate the intellectual_dna_shelf table with books from dna_analysis_results_matched
INSERT INTO intellectual_dna_shelf (user_id, domain, type, position, book_id, created_at, updated_at)
SELECT 
    dar.user_id,
    extract_domain_from_field_name(darm.field_name) AS domain,
    extract_type_from_field_name(darm.field_name) AS type,
    extract_position_from_field_name(darm.field_name) AS position,
    darm.matched_id AS book_id,
    NOW() AS created_at,
    NOW() AS updated_at
FROM 
    dna_analysis_results dar
JOIN 
    dna_analysis_results_matched darm ON dar.assessment_id = darm.assessment_id
WHERE 
    -- Only include entries where matched_id is a book
    darm.matched_id IN (SELECT id FROM books)
    -- Only include entries with classic in the field_name (book entries)
    AND darm.field_name LIKE '%classic%'
    -- Only include valid domain, type, and position
    AND extract_domain_from_field_name(darm.field_name) IS NOT NULL
    AND extract_type_from_field_name(darm.field_name) IS NOT NULL
    AND extract_position_from_field_name(darm.field_name) IS NOT NULL
ON CONFLICT (user_id, domain, type, position) 
DO UPDATE SET
    book_id = EXCLUDED.book_id,
    updated_at = NOW();

-- Drop the temporary functions
DROP FUNCTION IF EXISTS extract_domain_from_field_name;
DROP FUNCTION IF EXISTS extract_type_from_field_name;
DROP FUNCTION IF EXISTS extract_position_from_field_name;

-- Commit the transaction
COMMIT;
