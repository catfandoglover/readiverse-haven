import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import openRouterService from '@/services/OpenRouterService';

export function OpenRouterExample() {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await openRouterService.generateChatCompletion(
        [
          { role: 'system', content: 'You are a helpful, concise assistant.' },
          { role: 'user', content: prompt }
        ],
        'anthropic/claude-3.7-sonnet',
        { 
          temperature: 0.7,
          max_tokens: 300
        }
      );
      
      // Extract the response content
      const responseText = result.choices?.[0]?.message?.content || 'No response received';
      setResponse(responseText);
    } catch (err) {
      console.error('Error calling OpenRouter:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResponse('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>OpenRouter API Example</CardTitle>
        <CardDescription>
          This component demonstrates using the OpenRouterService to make secure API calls.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              Your prompt
            </label>
            <Textarea
              id="prompt"
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}
          
          {response && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Response:</h3>
              <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">
                {response}
              </div>
            </div>
          )}
        </form>
      </CardContent>
      
      <CardFooter>
        <Button 
          type="submit" 
          onClick={handleSubmit} 
          disabled={isLoading || !prompt.trim()}
          className="ml-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Send to OpenRouter'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 