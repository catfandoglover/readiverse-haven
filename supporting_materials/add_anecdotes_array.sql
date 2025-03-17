
-- Add anecdotes array column to icons table
ALTER TABLE icons ADD COLUMN anecdotes text[] DEFAULT '{}';

-- If you have existing data in a text 'anecdotes' column, you might want to migrate it
-- Uncomment and modify this if needed:
-- UPDATE icons 
-- SET anecdotes = string_to_array(anecdotes, '|')
-- WHERE anecdotes IS NOT NULL;
