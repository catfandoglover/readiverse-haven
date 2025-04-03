import { createClient } from '@supabase/supabase-js';

// Hardcode Supabase URL and anon key from client.ts
const supabaseUrl = "https://myeyoafugkrkwcnfedlu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15ZXlvYWZ1Z2tya3djbmZlZGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMTEzMTAsImV4cCI6MjA1ODY4NzMxMH0.aYCbR62ym2XYDdY6Ss6sGj14yOy3i8wj9f5gHujmqDI";

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// The assessment ID we're trying to find
const assessmentId = 'b0f50af6-589b-4dcd-bd63-3a18f1e5da20';

async function runTests() {
  console.log('===== TESTING DNA QUERY =====');
  console.log('Looking for assessment_id:', assessmentId);
  
  try {
    console.log('\n--- TEST 1: Direct query with assessment_id ---');
    const { data: directResult, error: directError } = await supabase
      .from('dna_analysis_results')
      .select('*')
      .eq('assessment_id', assessmentId);
      
    console.log('Result:', directResult);
    console.log('Error:', directError);
    console.log('Found records:', directResult?.length || 0);
    
    console.log('\n--- TEST 2: Get sample of all records ---');
    const { data: allRecords, error: allError } = await supabase
      .from('dna_analysis_results')
      .select('id, assessment_id')
      .limit(5);
      
    console.log('Sample records:', allRecords);
    console.log('Error:', allError);
    console.log('Records found:', allRecords?.length || 0);
    
    console.log('\n--- TEST 3: Try with partial match ---');
    // Try with just first part of the ID to see if format issues
    const partialId = assessmentId.split('-')[0]; 
    const { data: partialResult, error: partialError } = await supabase
      .from('dna_analysis_results')
      .select('id, assessment_id')
      .like('assessment_id', `${partialId}%`);
      
    console.log('Partial match results:', partialResult);
    console.log('Error:', partialError);
    console.log('Records found:', partialResult?.length || 0);
    
    console.log('\n--- TEST 4: Check string comparison ---');
    // Check if the value is stored differently
    if (allRecords && allRecords.length > 0) {
      for (const record of allRecords) {
        console.log(`Record ID: ${record.id}`);
        console.log(`Assessment ID: ${record.assessment_id}`);
        console.log(`Matches expected?: ${record.assessment_id === assessmentId}`);
        
        if (record.assessment_id && assessmentId) {
          // Compare character by character
          console.log('Character comparison:');
          const a1 = record.assessment_id;
          const a2 = assessmentId;
          const minLength = Math.min(a1.length, a2.length);
          
          for (let i = 0; i < minLength; i++) {
            if (a1[i] !== a2[i]) {
              console.log(`Mismatch at position ${i}: '${a1[i]}' vs '${a2[i]}'`);
              console.log(`Char codes: ${a1.charCodeAt(i)} vs ${a2.charCodeAt(i)}`);
            }
          }
          
          if (a1.length !== a2.length) {
            console.log(`Length mismatch: ${a1.length} vs ${a2.length}`);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error running tests:', err);
  }
}

runTests(); 