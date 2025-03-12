# Vercel Deployment Guide

This guide provides detailed instructions for deploying the application to Vercel and troubleshooting common issues with serverless functions.

## Required Environment Variables

The following environment variables must be set in your Vercel project settings:

1. **Google Gemini API Key**:
   - Name: `GOOGLE_GEMINI_API_KEY`
   - Value: Your Google Gemini API key
   - Used for: AI chat and audio transcription

2. **AWS Credentials for Polly Text-to-Speech**:
   - Name: `AWS_REGION` (typically 'us-east-1')
   - Name: `AWS_ACCESS_KEY_ID`
   - Name: `AWS_SECRET_ACCESS_KEY`
   - Used for: Text-to-speech functionality

## Setting Up Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to "Settings" > "Environment Variables"
4. Add each variable with its corresponding value
5. Click "Save" to apply the changes
6. Redeploy your application for the changes to take effect

**Important**: Do not use the `VITE_` prefix for these environment variables as they are used in serverless functions, not in the frontend.

## Verifying Environment Variables

After deployment, you can verify that your environment variables are correctly configured by visiting these endpoints:

- `/api/check-env` - Checks if the Google Gemini API key is configured
- `/api/check-aws` - Checks if the AWS credentials are configured and valid

## Troubleshooting Common Issues

### 1. 500 Internal Server Error in API Endpoints

If you're seeing 500 errors in your API endpoints, check the following:

#### For `/api/chat` and `/api/transcribe` endpoints:
- Verify that your `GOOGLE_GEMINI_API_KEY` is correctly set in Vercel
- Check that the API key has access to the Gemini API
- Ensure you're not exceeding API rate limits

#### For `/api/text-to-speech` endpoint:
- Verify that all AWS credentials are correctly set in Vercel
- Check that the AWS IAM user has permissions for Amazon Polly
- Ensure the region is correctly set (default is 'us-east-1')

### 2. Debugging Serverless Functions

To debug issues with serverless functions:

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to "Deployments" and select the latest deployment
4. Click on "Functions" to see all serverless functions
5. Click on a function to view its logs and execution details

### 3. Common Error Messages and Solutions

#### "FUNCTION_INVOCATION_FAILED"
- This indicates an error in the serverless function execution
- Check the function logs in Vercel for more details
- Verify that all required environment variables are set

#### "AWS credentials not configured"
- The AWS credentials are missing or incorrect
- Check that `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are correctly set

#### "API key not configured"
- The Google Gemini API key is missing
- Check that `GOOGLE_GEMINI_API_KEY` is correctly set

## Testing the Deployment

After deploying, test each of the following features:

1. **AI Chat**: Try sending a message to the AI assistant
2. **Text-to-Speech**: Test the audio playback functionality
3. **Audio Transcription**: Test the voice input functionality

If any of these features fail, check the browser console for error messages and the Vercel function logs for more details.

## Updating the Deployment

When making changes to the serverless functions:

1. Test locally using `vercel dev` if possible
2. Push changes to your repository
3. Vercel will automatically deploy the changes
4. Check the function logs to verify the changes are working as expected

## Additional Resources

- [Vercel Serverless Functions Documentation](https://vercel.com/docs/functions)
- [AWS SDK for JavaScript Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Google Gemini API Documentation](https://ai.google.dev/docs/gemini_api) 
