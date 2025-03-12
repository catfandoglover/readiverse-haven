import { VercelRequest, VercelResponse } from '@vercel/node';
import { PollyClient, DescribeVoicesCommand } from '@aws-sdk/client-polly';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Get AWS credentials from environment variables
    const region = process.env.AWS_REGION || 'us-east-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    // Check if credentials are configured
    const hasCredentials = !!accessKeyId && !!secretAccessKey;
    
    if (!hasCredentials) {
      return res.status(200).json({
        hasAwsCredentials: false,
        message: 'AWS credentials are not configured'
      });
    }
    
    // Try to initialize the Polly client and make a simple request
    try {
      const polly = new PollyClient({
        region,
        credentials: {
          accessKeyId: accessKeyId!,
          secretAccessKey: secretAccessKey!
        }
      });
      
      // Make a simple request to check if credentials are valid
      const command = new DescribeVoicesCommand({});
      const response = await polly.send(command);
      
      // If we get here, the credentials are valid
      return res.status(200).json({
        hasAwsCredentials: true,
        isValid: true,
        voicesCount: response.Voices?.length || 0,
        region
      });
    } catch (awsError) {
      // If we get here, the credentials are invalid
      console.error('AWS error:', awsError instanceof Error ? awsError.message : String(awsError));
      return res.status(200).json({
        hasAwsCredentials: true,
        isValid: false,
        error: awsError instanceof Error ? awsError.message : String(awsError),
        region
      });
    }
  } catch (error) {
    console.error('Error checking AWS credentials:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
} 
