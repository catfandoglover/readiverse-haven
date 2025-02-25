// Test script for analyze-dna function - ES Module version
import fetch from 'node-fetch';

// Get the API key from command line argument
const openrouterApiKey = process.argv[2];

if (!openrouterApiKey) {
  console.error('Error: Please provide your OpenRouter API key as a command line argument.');
  console.error('Usage: node test-analyze-function.js YOUR_API_KEY');
  process.exit(1);
}

console.log("API Key provided:", openrouterApiKey.substring(0, 5) + "...");

// Simplified test prompt similar to what's in your actual prompts.ts
async function testPromptFormatting() {
  console.log("\nTesting prompt formatting with claude-3.5-sonnet");
  
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
    }
  };
  
  const answers_json = JSON.stringify(sampleAnswers);
  
  // This is a simplified version of your prompt to test the basic functionality
  const prompt = `Analyze the following philosophical answers and provide insights in second person ("you"). 
Format your response as a valid JSON object with the exact field names shown in the template below:

Template:
{
  "archetype": "Archetype name (format: [First Word] [Second Word])",
  "archetype_definition": "Brief poetic subtitle",
  "introduction": "Opening paragraph"
}

${answers_json}`;

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
        model: 'anthropic/claude-3.5-sonnet',
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

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();
    
    console.log('API Response Status:', response.status);
    
    if (!data?.choices?.[0]?.message?.content) {
      console.error('Unexpected API response structure');
      return;
    }

    const content = data.choices[0].message.content;
    console.log('\nRaw content:');
    console.log('==========');
    console.log(content);
    console.log('==========');
    
    // Try to parse the JSON response
    try {
      const parsedContent = JSON.parse(content);
      console.log('\nSuccessfully parsed JSON with keys:', Object.keys(parsedContent));
      console.log('\nParsed content:');
      console.log(JSON.stringify(parsedContent, null, 2));
    } catch (e) {
      console.error('\nError parsing JSON response:', e);
      
      // Try to extract any JSON-like structure from the response
      console.log('\nAttempting to extract JSON from response...');
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('Potential JSON structure found:');
        console.log(jsonMatch[0]);
        
        try {
          const extracted = JSON.parse(jsonMatch[0]);
          console.log('Successfully parsed extracted JSON with keys:', Object.keys(extracted));
        } catch (extractError) {
          console.error('Failed to parse extracted JSON:', extractError);
        }
      } else {
        console.log('No JSON-like structure found in response');
      }
    }
  } catch (error) {
    console.error('General error:', error);
  }
}

await testPromptFormatting();
console.log("Test completed");