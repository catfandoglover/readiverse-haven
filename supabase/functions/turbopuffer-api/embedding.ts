// Utility function to create embeddings using OpenAI
export async function createOpenAIEmbedding(text: string, apiKey: string): Promise<number[]> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error creating OpenAI embedding:', error);
    throw error;
  }
} 