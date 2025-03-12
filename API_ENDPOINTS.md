# Vercel Serverless API Endpoints

This project implements three serverless API endpoints to handle secure operations without exposing credentials in the client-side code:

## 1. Audio Transcription Endpoint

**Path**: `/api/transcribe`

**Purpose**: Securely handles audio transcription using Google's Gemini API

**Implementation**:
- Takes audio data from the client
- Sends it to Gemini with server-side API key
- Returns transcription text

**Configuration**:
- Requires `GOOGLE_GEMINI_API_KEY` in the Vercel environment variables (without the `VITE_` prefix)

## 2. Chat Response Endpoint

**Path**: `/api/chat`

**Purpose**: Securely handles AI chat interactions using Google's Gemini API

**Implementation**:
- Takes message data from the client
- Sends it to Gemini with server-side API key
- Returns AI-generated response text

**Configuration**:
- Requires `GOOGLE_GEMINI_API_KEY` in the Vercel environment variables (without the `VITE_` prefix)

## 3. Text-to-Speech Endpoint

**Path**: `/api/text-to-speech`

**Purpose**: Securely handles text-to-speech conversion using AWS Polly

**Implementation**:
- Takes text and voice configuration from the client
- Generates speech using AWS Polly with server-side credentials
- Returns a presigned URL to the audio file

**Configuration**:
- Requires the following in Vercel environment variables:
  - `AWS_REGION` (usually 'us-east-1')
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`

## How to Deploy

1. Ensure your Vercel account is connected to this repository
2. Set up environment variables in the Vercel project settings:
   - Remove the `VITE_` prefix from all API-related environment variables
   - Add `GOOGLE_GEMINI_API_KEY`
   - Add `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
3. Deploy the project with `vercel --prod` or using the Vercel dashboard

## Security Benefits

- API keys and credentials are completely server-side
- Reduced risk of exposure compared to client-side implementation
- API calls are proxied through your own domain
- Can implement additional rate limiting and validation

## Client Implementation

The client code has been updated to use these endpoints instead of directly calling the external APIs. Check the following files:
- `src/services/AudioTranscriptionService.ts`
- `src/services/AIService.ts`
- `src/services/SpeechService.ts`
