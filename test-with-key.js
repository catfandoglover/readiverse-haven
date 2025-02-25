// Test script that accepts OpenRouter API key as command line argument - ES Module version
import fetch from 'node-fetch';

// Get the API key from command line argument
const openrouterApiKey = process.argv[2];

if (!openrouterApiKey) {
  console.error('Error: Please provide your OpenRouter API key as a command line argument.');
  console.error('Usage: node test-with-key.js YOUR_API_KEY');
  process.exit(1);
}

console.log("API Key provided:", openrouterApiKey.substring(0, 5) + "...");

// Test function to call OpenRouter with a specific model
async function testModel(modelName) {
  console.log(`\nTesting model: ${modelName}`);
  
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

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
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
    console.error('Error calling API:', error.message);
    return { success: false, error: error.message };
  }
}

// Main function to test the models
async function main() {
  console.log("Testing connection to OpenRouter API...");
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`
      }
    });
    
    console.log(`OpenRouter models API status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const models = await response.json();
      console.log('Available Claude models:', models.data
        .filter(m => m.id.includes('claude'))
        .map(m => m.id));
    } else {
      console.error('Could not fetch models:', await response.text());
    }
  } catch (error) {
    console.error('Error checking OpenRouter:', error.message);
  }

  // Test the original model from the code
  console.log("\n=== Testing claude-3.5-sonnet ===");
  await testModel('anthropic/claude-3.5-sonnet');
  
  // Test the new model
  console.log("\n=== Testing claude-3.7-sonnet ===");
  await testModel('anthropic/claude-3.7-sonnet');
}

// Run the test
main().catch(console.error);