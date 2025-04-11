from openai import OpenAI

# Use the newest API key
api_key = "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"

print(f"Testing OpenRouter API with newest key: {api_key[:5]}...{api_key[-5:]}")

# Create OpenAI client configured for OpenRouter
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
    default_headers={
        "HTTP-Referer": "https://readiverse-haven.com",
        "X-Title": "Virgil_readbot_test",
    }
)

# Try to get a simple completion
print("\nSending completion request to OpenRouter API...")
try:
    completion = client.chat.completions.create(
        model="anthropic/claude-3.7-sonnet",
        messages=[
            {"role": "user", "content": "Say hello! Just one sentence please."}
        ],
        max_tokens=50
    )

    # Print the response
    print("\nSuccess! Response received:")
    print(f"Content: {completion.choices[0].message.content}")
    print(f"Model: {completion.model}")
    print(f"Usage - Prompt tokens: {completion.usage.prompt_tokens}")
    print(f"Usage - Completion tokens: {completion.usage.completion_tokens}")
    print(f"Usage - Total tokens: {completion.usage.total_tokens}")
    
except Exception as e:
    print(f"\nError: {str(e)}")
    print("\nThis suggests the API key might be invalid or there's an authentication issue.") 