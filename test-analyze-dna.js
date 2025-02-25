// Test script for analyze-dna function

require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const openrouterApiKey = process.env.OPENROUTER_API_KEY;
console.log("API Key available:", !!openrouterApiKey);

if (!openrouterApiKey) {
  console.error('Error: OPENROUTER_API_KEY not found in .env.local file');
  process.exit(1);
}

// Small sample of answers_json for testing
const sampleAnswers = {
  "theology": {
    "Q1": "Yes",
    "A": "Yes", 
    "AA": "Yes"
  },
  "ontology": {
    "Q1": "Agree",
    "A": "Discovering",
    "AA": "Yes"
  },
  "epistemology": {
    "Q1": "Agree",
    "A": "Agree",
    "AA": "Agree"
  }
};

// Simplified version of the analyze function
async function testAnalysis() {
  const section = 1; // Test only section 1
  const answers_json = JSON.stringify(sampleAnswers);
  
  // Simple prompt for testing
  const prompt = `Analyze the following philosophical answers and provide insights.
Format your response as a valid JSON object with these exact field names:
{
  "archetype": "Example Archetype",
  "archetype_definition": "Brief poetic subtitle",
  "introduction": "Opening paragraph"
}

${answers_json}`;

  try {
    console.log("Testing OpenRouter API with simplified prompt...");
    
    // Test with different Claude models
    await testWithModel('anthropic/claude-3.5-sonnet', prompt);
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

async function testWithModel(modelName, prompt) {
  console.log(`\nTesting with model: ${modelName}`);
  
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
            content: 'You are a philosophical profiler who analyzes philosophical tendencies and provides insights in the second person ("you"). Always return your response as a valid JSON object with the exact field names specified in the template.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}`);
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();
    
    console.log('API Response Status:', response.status);
    console.log('Response structure:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
    
    if (!data?.choices?.[0]?.message?.content) {
      console.error('Unexpected API response structure');
      return;
    }

    console.log('Raw content (first 200 chars):', data.choices[0].message.content.substring(0, 200) + '...');
    
    // Try to parse the JSON response
    try {
      const parsedContent = JSON.parse(data.choices[0].message.content);
      console.log('Successfully parsed JSON with keys:', Object.keys(parsedContent));
      return parsedContent;
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      console.error('Raw content:', data.choices[0].message.content);
      return null;
    }
  } catch (error) {
    console.error('Error calling API:', error);
    return null;
  }
}

// Run the test
testAnalysis().catch(console.error);