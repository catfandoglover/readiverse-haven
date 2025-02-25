// Simple test script to check OpenRouter API with different Claude models

require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const openrouterApiKey = process.env.OPENROUTER_API_KEY;
console.log("API Key available:", !!openrouterApiKey);

if (!openrouterApiKey) {
  console.error('Error: OPENROUTER_API_KEY not found in .env.local file');
  process.exit(1);
}

// Test function to call OpenRouter with a specific model
async function testModel(modelName) {
  console.log(`Testing model: ${modelName}`);
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Lovable.dev'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that returns JSON. Always include { "test": "successful" } in your response.'
          },
          {
            role: 'user',
            content: 'Return a simple JSON response to test if you are working.'
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}`);
      console.error('Error details:', errorText);
      return { success: false, error: errorText };
    }

    const data = await response.json();
    
    if (!data?.choices?.[0]?.message?.content) {
      console.error('Unexpected API response structure:', data);
      return { success: false, error: 'Invalid API response structure' };
    }

    console.log('Response content:', data.choices[0].message.content);
    
    // Try to parse the JSON response
    try {
      const parsedContent = JSON.parse(data.choices[0].message.content);
      console.log('Successfully parsed JSON:', parsedContent);
      return { success: true, data: parsedContent };
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      console.error('Raw content:', data.choices[0].message.content);
      return { success: false, error: 'Invalid JSON response from AI', raw: data.choices[0].message.content };
    }
  } catch (error) {
    console.error('Error calling API:', error);
    return { success: false, error: error.message };
  }
}

// Main function to test multiple models
async function main() {
  // Check if OpenRouter is accessible
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models');
    if (!response.ok) {
      console.error('OpenRouter API is not accessible');
      return;
    }
    const models = await response.json();
    console.log('Available models:', models.data.map(m => m.id).filter(id => id.includes('claude')));
  } catch (error) {
    console.error('Error checking OpenRouter:', error);
  }

  // Test the original model from your code
  await testModel('anthropic/claude-3.5-sonnet');
  
  // Test other Claude models that might be available
  await testModel('anthropic/claude-3.7-sonnet');
  await testModel('anthropic/claude-3-opus');
  await testModel('anthropic/claude-3-sonnet');
  
  console.log('All tests completed');
}

main().catch(console.error);