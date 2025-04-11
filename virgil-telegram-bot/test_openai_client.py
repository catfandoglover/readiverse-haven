try:
    from openai import OpenAI
except ImportError:
    print("OpenAI Python package not installed. Installing it now...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "openai"])
    from openai import OpenAI

import os
import sys

# Use the API key from command line, environment or from virgil_bot.py
api_key = "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"

print(f"Testing OpenRouter API with Claude 3.7 Sonnet using OpenAI client")
print(f"API Key: {api_key[:5]}...{api_key[-5:]}")

try:
    # Create OpenAI client configured for OpenRouter
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )

    # Try to get a simple completion
    print("\nSending completion request to OpenRouter API...")
    completion = client.chat.completions.create(
        extra_headers={
            "HTTP-Referer": "https://readiverse-haven.com", 
            "X-Title": "Virgil_readbot_test",
        },
        model="anthropic/claude-3.7-sonnet",
        messages=[
            {
                "role": "user",
                "content": "Please respond with a single line: 'Hello from Claude 3.7 Sonnet via OpenRouter!'"
            }
        ],
        max_tokens=150
    )

    # Print the response
    print("\nResponse received!")
    print(f"Content: {completion.choices[0].message.content}")
    print(f"Model: {completion.model}")
    print(f"Usage - Prompt tokens: {completion.usage.prompt_tokens}")
    print(f"Usage - Completion tokens: {completion.usage.completion_tokens}")
    print(f"Usage - Total tokens: {completion.usage.total_tokens}")
    
except Exception as e:
    print(f"\nError: {str(e)}")
    
    # Try with Claude 3.5 as a fallback
    print("\nTrying with Claude 3.5 as a fallback...")
    try:
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "https://readiverse-haven.com", 
                "X-Title": "Virgil_readbot_test",
            },
            model="anthropic/claude-3-5-sonnet-20240620",
            messages=[
                {
                    "role": "user",
                    "content": "Please respond with a single line: 'Hello from Claude 3.5 Sonnet via OpenRouter!'"
                }
            ],
            max_tokens=150
        )
        
        print("\nResponse received from Claude 3.5!")
        print(f"Content: {completion.choices[0].message.content}")
        
    except Exception as e2:
        print(f"\nError with Claude 3.5 fallback: {str(e2)}")
        
        # Try one more fallback - GPT-3.5 Turbo
        print("\nTrying with GPT-3.5 Turbo as a final fallback...")
        try:
            completion = client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": "https://readiverse-haven.com", 
                    "X-Title": "Virgil_readbot_test",
                },
                model="openai/gpt-3.5-turbo",
                messages=[
                    {
                        "role": "user",
                        "content": "Please respond with a single line: 'Hello from GPT-3.5 Turbo via OpenRouter!'"
                    }
                ],
                max_tokens=150
            )
            
            print("\nResponse received from GPT-3.5 Turbo!")
            print(f"Content: {completion.choices[0].message.content}")
            
        except Exception as e3:
            print(f"\nError with GPT-3.5 Turbo fallback: {str(e3)}")
            
            # Try to get available models as a last resort
            print("\nTrying to fetch available models...")
            try:
                models = client.models.list()
                print(f"Available models: {len(models.data)}")
                for model in models.data[:5]:
                    print(f"- {model.id}")
                if len(models.data) > 5:
                    print(f"... and {len(models.data) - 5} more")
            except Exception as e4:
                print(f"\nError fetching models: {str(e4)}")
                print("\nAuthentication is failing completely. Please check your API key and try again.") 