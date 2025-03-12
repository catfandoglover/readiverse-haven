# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/8bf7cf55-cb83-43c1-81f0-a37e02f0ed64

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8bf7cf55-cb83-43c1-81f0-a37e02f0ed64) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8bf7cf55-cb83-43c1-81f0-a37e02f0ed64) and click on Share -> Publish.

### Vercel Deployment

This project uses Vercel serverless functions for API endpoints. When deploying to Vercel, you need to set the following environment variables:

- `GOOGLE_GEMINI_API_KEY`: Your Google Gemini API key (required for AI chat functionality)
- `AWS_REGION`: AWS region for Polly (typically 'us-east-1')
- `AWS_ACCESS_KEY_ID`: Your AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key

To set these environment variables in Vercel:
1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with its corresponding value
4. Redeploy your application for the changes to take effect

Note: Do not use the `VITE_` prefix for these environment variables as they are used in serverless functions, not in the frontend.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
