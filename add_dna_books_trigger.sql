-- Function to extract domain from field_name
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

-- Function to extract type (kindred vs challenging) from field_name
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

-- Function to extract position (1-5) from field_name
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

-- Create the trigger function to process new dna_analysis_results_matched entries
CREATE OR REPLACE FUNCTION process_dna_book_matches()
RETURNS TRIGGER AS $$
DECLARE
    user_id UUID;
    domain TEXT;
    type_val TEXT;
    position_val INTEGER;
BEGIN
    -- Only process entries that are books (classic in the field_name)
    IF NEW.field_name LIKE '%classic%' AND 
       (NEW.field_name LIKE '%kindred_spirit%' OR NEW.field_name LIKE '%challenging_voice%') THEN
        
        -- Extract domain, type, and position from field_name
        domain := extract_domain_from_field_name(NEW.field_name);
        type_val := extract_type_from_field_name(NEW.field_name);
        position_val := extract_position_from_field_name(NEW.field_name);
        
        -- Verify we have valid values
        IF domain IS NULL OR type_val IS NULL OR position_val IS NULL THEN
            RAISE NOTICE 'Invalid field_name format: %', NEW.field_name;
            RETURN NEW;
        END IF;
        
        -- Get the user_id from the dna_analysis_results table
        SELECT user_id INTO user_id
        FROM dna_analysis_results
        WHERE assessment_id = NEW.assessment_id;
        
        IF user_id IS NULL THEN
            RAISE NOTICE 'No user_id found for assessment_id: %', NEW.assessment_id;
            RETURN NEW;
        END IF;
        
        -- Check if the matched_id exists in the books table
        IF EXISTS (SELECT 1 FROM books WHERE id = NEW.matched_id) THEN
            -- Add the book to the user's bookshelf if not already there
            INSERT INTO user_books (user_id, book_id, created_at, updated_at)
            VALUES (user_id, NEW.matched_id, NOW(), NOW())
            ON CONFLICT (user_id, book_id) DO NOTHING;
            
            -- Add or update the entry in the intellectual_dna_shelf table
            INSERT INTO intellectual_dna_shelf (
                user_id, domain, type, position, book_id, created_at, updated_at
            ) VALUES (
                user_id, domain, type_val, position_val, NEW.matched_id, NOW(), NOW()
            )
            ON CONFLICT (user_id, domain, type, position) 
            DO UPDATE SET
                book_id = NEW.matched_id,
                updated_at = NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger on the dna_analysis_results_matched table
DROP TRIGGER IF EXISTS dna_book_matches_trigger ON dna_analysis_results_matched;
CREATE TRIGGER dna_book_matches_trigger
AFTER INSERT OR UPDATE ON dna_analysis_results_matched
FOR EACH ROW EXECUTE FUNCTION process_dna_book_matches(); 