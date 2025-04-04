import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const TestUpload: React.FC = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [bucketsList, setBucketsList] = useState<string[]>([]);
  const [isCheckingBuckets, setIsCheckingBuckets] = useState(false);

  const handleTestUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    setIsUploading(true);
    setUploadResult(null);
    console.log('Starting test upload process...');
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
    
    try {
      // Generate a simple timestamp-based file name
      const fileExt = file.name.split('.').pop();
      const fileName = `test-${Date.now()}.${fileExt}`;
      console.log('Test file path:', fileName);
      
      // Try uploading to the profile_images bucket
      console.log('Attempting upload to profile_images bucket...');
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('profile_images')
        .upload(fileName, file, {
          upsert: true
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        setUploadResult({
          success: false,
          message: `Upload failed: ${uploadError.message}`,
          details: uploadError
        });
        return;
      }
      
      console.log('Upload successful:', uploadData);
      
      // Get public URL
      const { data: publicURLData } = supabase.storage
        .from('profile_images')
        .getPublicUrl(fileName);
      
      setUploadResult({
        success: true,
        message: 'File uploaded successfully!',
        details: {
          path: fileName,
          publicUrl: publicURLData?.publicUrl || 'No public URL available'
        }
      });
      
    } catch (error) {
      console.error('Error in test upload:', error);
      setUploadResult({
        success: false,
        message: `Exception: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    } finally {
      setIsUploading(false);
    }
  };

  const checkBuckets = async () => {
    setIsCheckingBuckets(true);
    try {
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error("Error listing buckets:", error);
        setUploadResult({
          success: false,
          message: `Failed to list buckets: ${error.message}`,
          details: error
        });
        return;
      }
      
      const bucketNames = data.map(bucket => bucket.name);
      console.log("Available buckets:", bucketNames);
      setBucketsList(bucketNames);
      
      setUploadResult({
        success: true,
        message: `Found ${bucketNames.length} buckets`,
        details: { buckets: bucketNames }
      });
    } catch (error) {
      console.error("Error checking buckets:", error);
      setUploadResult({
        success: false,
        message: `Exception listing buckets: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    } finally {
      setIsCheckingBuckets(false);
    }
  };

  return (
    <div className="p-8 bg-[#2A282A] text-[#E9E7E2] min-h-screen">
      <h1 className="text-2xl font-bold mb-8">Storage Upload Test</h1>
      
      <div className="bg-[#373741] p-6 rounded-lg max-w-md mb-8">
        <h2 className="text-xl mb-4">Test File Upload</h2>
        
        <div className="mb-6">
          <Button 
            variant="outline" 
            className="relative bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] border-0 w-full"
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Select Test File"}
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleTestUpload}
              disabled={isUploading}
            />
          </Button>
        </div>
      </div>
      
      <div className="bg-[#373741] p-6 rounded-lg max-w-md mb-8">
        <h2 className="text-xl mb-4">Check Storage Buckets</h2>
        <Button 
          variant="outline" 
          className="bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] border-0 w-full"
          onClick={checkBuckets}
          disabled={isCheckingBuckets}
        >
          {isCheckingBuckets ? "Checking..." : "List Available Buckets"}
        </Button>
        
        {bucketsList.length > 0 && (
          <div className="mt-4 p-3 bg-black/30 rounded">
            <h3 className="font-semibold mb-2">Available Buckets:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {bucketsList.map(bucket => (
                <li key={bucket} className="text-sm">{bucket}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {uploadResult && (
        <div className={`p-6 rounded-lg max-w-md ${uploadResult.success ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
          <h3 className="font-bold mb-2 text-xl">{uploadResult.success ? 'Success' : 'Error'}</h3>
          <p className="mb-4">{uploadResult.message}</p>
          
          {uploadResult.details && (
            <div className="mt-4">
              <p className="text-sm text-[#E9E7E2]/70 mb-1">Details:</p>
              <pre className="text-xs bg-black/30 p-3 rounded overflow-x-auto">
                {JSON.stringify(uploadResult.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-[#373741] rounded-lg max-w-md">
        <h3 className="text-lg font-bold mb-3">User Information</h3>
        <div className="text-sm space-y-2">
          <p><span className="text-[#E9E7E2]/70">User ID:</span> {user?.id || 'Not logged in'}</p>
          <p><span className="text-[#E9E7E2]/70">Email:</span> {user?.email || 'N/A'}</p>
          {user?.user_metadata && (
            <div>
              <p className="text-[#E9E7E2]/70 mb-1">User Metadata:</p>
              <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto">
                {JSON.stringify(user.user_metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestUpload; 