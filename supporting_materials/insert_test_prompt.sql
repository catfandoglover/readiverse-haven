
-- This is a sample SQL script to add test prompts to the database
-- Run this in the Supabase SQL editor

-- Clear existing prompts if needed (uncomment to use)
-- DELETE FROM prompts;

-- Insert three test prompts with different sections
INSERT INTO prompts (
  id, 
  user_title, 
  user_subtitle, 
  prompt, 
  section, 
  context, 
  display_order
)
VALUES 
(101, 'Philosophy Discussion', 'Explore deep questions with Virgil', 'What philosophical topic would you like to discuss today?', 'intellectual', 'chat', 1),
(102, 'Creative Writing', 'Get help with your creative projects', 'Tell me about the creative project you\'re working on.', 'practical', 'chat', 2),
(103, 'Emotional Support', 'Talk through your feelings', 'How are you feeling today? What\'s on your mind?', 'emotional', 'chat', 3);

-- Run a test query to verify the prompts were added
-- SELECT * FROM prompts;
