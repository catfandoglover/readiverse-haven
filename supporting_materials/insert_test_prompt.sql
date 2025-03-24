
-- This is a sample SQL script to add a test prompt to the database
-- Run this in the Supabase SQL editor

INSERT INTO prompts (
  id, 
  user_title, 
  user_subtitle, 
  prompt, 
  section, 
  context, 
  display_order
)
VALUES (
  1, 
  'Test Chat Prompt', 
  'A sample chat prompt for testing', 
  'How can I help you today?', 
  'intellectual', 
  'chat', 
  1
);

-- If you need more test prompts, here are two more examples:

INSERT INTO prompts (
  id, 
  user_title, 
  user_subtitle, 
  prompt, 
  section, 
  context, 
  display_order
)
VALUES (
  2, 
  'Discuss Philosophy', 
  'Explore philosophical ideas with Virgil', 
  'What philosophical questions are on your mind today?', 
  'intellectual', 
  'chat', 
  2
);

INSERT INTO prompts (
  id, 
  user_title, 
  user_subtitle, 
  prompt, 
  section, 
  context, 
  display_order
)
VALUES (
  3, 
  'Emotional Support', 
  'Talk about feelings and emotions', 
  'How are you feeling today? Would you like to discuss any emotional challenges?', 
  'emotional', 
  'chat', 
  3
);
