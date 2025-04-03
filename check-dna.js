import { createClient } from '@supabase/supabase-js';

// Get your Supabase URL and key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkDnaRecords() {
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Assessment ID from the profile debug output
  const assessmentId = 'b0f50af6-589b-4dcd-bd63-3a18f1e5da20';
  
  console.log(`Checking for DNA records with assessment_id: ${assessmentId}`);
  
  // Query 1: Check using exact assessment_id match
  const { data: byAssessmentId, error: assessmentError } = await supabase
    .from('dna_analysis_results')
    .select('id, assessment_id')
    .eq('assessment_id', assessmentId);
    
  console.log('Results by assessment_id match:');
  console.log(byAssessmentId || 'No matches found');
  if (assessmentError) console.error('Error:', assessmentError);
  
  // Query 2: Check all DNA records to see what's available
  const { data: allRecords, error: allError } = await supabase
    .from('dna_analysis_results')
    .select('id, assessment_id')
    .limit(5);
    
  console.log('\nSample of available DNA records:');
  console.log(allRecords || 'No records found');
  if (allError) console.error('Error:', allError);
  
  // Query 3: Check if this ID exists as a regular ID in the table
  const { data: byId, error: idError } = await supabase
    .from('dna_analysis_results')
    .select('id, assessment_id')
    .eq('id', assessmentId);
    
  console.log('\nResults by ID match:');
  console.log(byId || 'No matches found');
  if (idError) console.error('Error:', idError);
}

checkDnaRecords()
  .catch(console.error); 