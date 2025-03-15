# Supabase Edge Functions

This directory contains Supabase Edge Functions for the application.

## Exchange Function

The `exchange` function is responsible for exchanging an Outseta JWT for a Supabase JWT. This allows users authenticated with Outseta to access Supabase resources.

### Deployment

To deploy the function:

```bash
supabase functions deploy exchange
```

### Environment Variables

The function requires the following environment variables:

- `OUTSETA_DOMAIN`: Your Outseta domain (e.g., `your-company.outseta.com`)
- `SUPA_JWT_SECRET`: Your Supabase JWT secret

Set these variables using:

```bash
supabase secrets set OUTSETA_DOMAIN=your-company.outseta.com
supabase secrets set SUPA_JWT_SECRET=your-supabase-jwt-secret
```

### Usage

Send a POST request to the function with the Outseta JWT in the Authorization header:

```javascript
const response = await fetch('https://your-project-ref.supabase.co/functions/v1/exchange', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${outsetaJwtToken}`
  }
});

const { supabaseJwt } = await response.json();

// Use the supabaseJwt to authenticate with Supabase
const supabase = createClient(
  'https://your-project-ref.supabase.co',
  'your-anon-key',
  {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseJwt}`
      }
    }
  }
);
```

### Troubleshooting

If you encounter TypeScript errors when working with the function locally, they are likely related to the Deno imports. These errors will not affect the function when deployed to Supabase.

The function uses:
- `npm:jose@4.14.4` for JWT operations
- Deno's standard HTTP server module

These dependencies are automatically handled by the Supabase Edge Functions runtime. 
