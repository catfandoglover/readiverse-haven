# Turbopuffer Integration

This document provides an overview of the Turbopuffer vector database integration with Supabase.

## Overview

Turbopuffer is a vector database service that allows for efficient storage and retrieval of embeddings. This integration allows the application to use Turbopuffer for:

- Document similarity search
- Content recommendation
- Semantic search functionality
- Vector-based filtering

## Setup

### Prerequisites

1. A Turbopuffer API key (set as `TURBOPUFFER_API_KEY` in Supabase edge function secrets)
2. Supabase project with Edge Functions enabled

### Files

The integration consists of the following key components:

1. **Edge Function**: `supabase/functions/turbopuffer-api/`
   - Provides an API for creating namespaces, upserting vectors, querying, and deleting
   
2. **Client-Side Utility**: `src/utils/turbopufferClient.ts`
   - Provides a TypeScript client for interacting with the Turbopuffer API
   
3. **Example Component**: `src/components/TurbopufferExample.tsx`
   - Demonstrates how to use the client library

## Deployment

1. Make the deployment script executable:
   ```
   chmod +x scripts/deploy-turbopuffer.sh
   ```

2. Run the deployment script:
   ```
   ./scripts/deploy-turbopuffer.sh
   ```

3. Test the deployment:
   ```
   supabase functions serve
   ```

## Usage

### Creating a namespace

```typescript
import { createTurbopufferClient } from '../utils/turbopufferClient';

const client = createTurbopufferClient('your-namespace-name');
await client.getOrCreateNamespace();
```

### Adding vectors

```typescript
// Create vector embeddings (this example uses random vectors)
const vector = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);

// Upsert the document with the vector
await client.upsert({
  vectors: [
    {
      id: '1',
      vector,
      attributes: {
        text: "This is the document content",
        public: 1,
        created_at: new Date().toISOString()
      }
    }
  ],
  distance_metric: 'cosine_distance',
  schema: {
    text: {
      type: 'string',
      full_text_search: true
    }
  }
});
```

### Querying vectors

```typescript
// Query for similar documents
const results = await client.query({
  vector, // The vector to search for similarity
  top_k: 5, // Return the top 5 results
  distance_metric: 'cosine_distance',
  filters: ["And", [["public", "Eq", 1]]], // Only return public documents
  include_attributes: ['text', 'created_at'], // Fields to include in response
  include_vectors: false // Don't include the vectors in response
});
```

### Deleting vectors

```typescript
// Delete vectors by ID
await client.delete(['1', '2', '3']);
```

## Production Considerations

For production use:

1. Use a proper embedding service (like OpenAI) instead of random vectors
2. Implement proper error handling and retries
3. Consider adding caching for frequently accessed vectors
4. Implement security measures to control access to different namespaces

## References

- [Turbopuffer Documentation](https://turbopuffer.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions) 