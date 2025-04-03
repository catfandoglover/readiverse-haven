-- Ensure open access to DNA exam tables
-- This handles any existing or future tables related to the intellectual DNA exams

-- For dna_exams table (if it exists)
CREATE POLICY IF NOT EXISTS "Anyone can read DNA exams" ON dna_exams
FOR SELECT
USING (true);

-- For intellectual_dna_exam table (if it exists)
CREATE POLICY IF NOT EXISTS "Anyone can read intellectual DNA exams" ON intellectual_dna_exam
FOR SELECT
USING (true);

-- For dna_exam_results table (if it exists)
CREATE POLICY IF NOT EXISTS "Anyone can read DNA exam results" ON dna_exam_results
FOR SELECT
USING (true);

-- For exam_badges table (if it exists)
CREATE POLICY IF NOT EXISTS "Anyone can read exam badges" ON exam_badges
FOR SELECT
USING (true);

-- Comment this out if the tables don't exist - this is a template to apply
-- to the right tables once you identify their exact names in the database 