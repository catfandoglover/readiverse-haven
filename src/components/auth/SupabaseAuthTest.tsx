
import React from 'react';
import { useAuth } from '@/contexts/OutsetaAuthContext';
import { Button } from '@/components/ui/button';

export function SupabaseAuthTest() {
  const { user, supabase } = useAuth();

  const testAuth = async () => {
    if (!supabase || !user) {
      console.log('No authenticated user or Supabase client');
      return;
    }

    try {
      // Try to insert a test record
      const { data: insertData, error: insertError } = await supabase
        .from('test_auth')
        .insert([
          { content: 'Test content', person_uid: user.Uid }
        ])
        .select()
        .single();

      console.log('Insert result:', { insertData, insertError });

      // Try to read all records for this user
      const { data: readData, error: readError } = await supabase
        .from('test_auth')
        .select('*')
        .eq('person_uid', user.Uid);

      console.log('Read result:', { readData, readError });
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  return (
    <div className="p-4">
      <Button 
        onClick={testAuth}
        disabled={!user || !supabase}
      >
        Test Supabase Auth
      </Button>
    </div>
  );
}
