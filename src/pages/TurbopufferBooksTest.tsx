import { useState, useEffect } from 'react';
import { createTurbopufferClient } from '../utils/turbopufferClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import type { Database } from '@/integrations/supabase/types';

// Type for the book data from Supabase
type Book = Database['public']['Tables']['books']['Row'];

// Mock embedding function for testing
// In production, you would use a proper embedding service
async function getEmbedding(text: string): Promise<number[]> {
  // Generate a deterministic vector based on the text content
  // This is just for testing - should be replaced with real embeddings
  const hash = text.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  // Create a 1536-dimensional vector (common OpenAI embedding size)
  return Array(1536).fill(0).map((_, i) => {
    // Generate values between -1 and 1 based on text and position
    return Math.sin((hash + i) * 0.1) * 0.5;
  });
}

export default function TurbopufferBooksTest() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [namespace, setNamespace] = useState('readiverse-books');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [operation, setOperation] = useState<'fetch' | 'save' | 'search' | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch books from Supabase
  const fetchBooks = async () => {
    setLoading(true);
    setOperation('fetch');
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .limit(10); // Limit to 10 books for testing
      
      if (error) throw error;
      
      setBooks(data || []);
      setResult({
        message: `Successfully fetched ${data?.length || 0} books`,
        data: data?.map(book => ({ id: book.id, title: book.title }))
      });
    } catch (err: any) {
      console.error('Error fetching books:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setOperation(null);
    }
  };
  
  // Save selected book to TurboPuffer
  const saveBookToTurboPuffer = async () => {
    if (!selectedBook) {
      setError('Please select a book first');
      return;
    }
    
    setLoading(true);
    setOperation('save');
    setError(null);
    
    try {
      // Create a client for the namespace
      const client = createTurbopufferClient(namespace);
      
      // Combine book title, about, and introduction for a richer text representation
      const bookText = [
        selectedBook.title,
        selectedBook.about,
        selectedBook.introduction
      ].filter(Boolean).join(' ');
      
      if (!bookText.trim()) {
        throw new Error('Book has no content to embed');
      }
      
      // Generate an embedding for the book text
      console.log('Generating embedding for book:', selectedBook.title);
      const vector = await getEmbedding(bookText);
      
      // Prepare book attributes to save
      const bookAttributes = {
        title: selectedBook.title,
        author: selectedBook.author,
        slug: selectedBook.slug,
        about: selectedBook.about,
        introduction: selectedBook.introduction,
        cover_url: selectedBook.cover_url,
        categories: selectedBook.categories,
      };
      
      // Upsert to TurboPuffer
      console.log('Upserting book to TurboPuffer:', selectedBook.id);
      const upsertResult = await client.upsert({
        vectors: [
          {
            id: selectedBook.id,
            vector: vector,
            attributes: bookAttributes
          }
        ],
        distance_metric: 'cosine_distance'
      });
      
      console.log('Upsert result:', upsertResult);
      setResult({
        message: `Successfully saved "${selectedBook.title}" to TurboPuffer`,
        book: selectedBook.title,
        result: upsertResult
      });
    } catch (err: any) {
      console.error('Error saving book to TurboPuffer:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setOperation(null);
    }
  };
  
  // Search for similar books
  const searchSimilarBooks = async () => {
    if (!selectedBook) {
      setError('Please select a book first');
      return;
    }
    
    setLoading(true);
    setOperation('search');
    setError(null);
    
    try {
      // Create a client for the namespace
      const client = createTurbopufferClient(namespace);
      
      // Combine book title, about, and introduction for a richer text representation
      const bookText = [
        selectedBook.title,
        selectedBook.about,
        selectedBook.introduction
      ].filter(Boolean).join(' ');
      
      if (!bookText.trim()) {
        throw new Error('Book has no content to search with');
      }
      
      // Generate an embedding for the book text
      console.log('Generating embedding for search:', selectedBook.title);
      const vector = await getEmbedding(bookText);
      
      // Query TurboPuffer
      console.log('Searching for similar books to:', selectedBook.title);
      const searchResult = await client.query({
        vector: vector,
        top_k: 5,
        distance_metric: 'cosine_distance',
        include_attributes: ['title', 'author', 'about'],
        include_vectors: false
      });
      
      console.log('Search result:', searchResult);
      setResult({
        message: `Found ${searchResult.results?.length || 0} similar books to "${selectedBook.title}"`,
        query: selectedBook.title,
        results: searchResult.results
      });
    } catch (err: any) {
      console.error('Error searching for similar books:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setOperation(null);
    }
  };
  
  // Fetch books on component mount
  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user]);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">TurboPuffer Books Test</h1>
      
      {!user && (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md mb-4">
          <p className="font-semibold">Authentication Required</p>
          <p className="text-sm">You need to be logged in to use this feature.</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>
        <div className="mb-4">
          <label className="block mb-2">
            Namespace:
            <input
              type="text"
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              className="ml-2 p-1 border rounded"
            />
          </label>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={fetchBooks}
            disabled={loading || !user}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {operation === 'fetch' && loading ? 'Fetching...' : 'Fetch Books'}
          </button>
        </div>
      </div>
      
      {books.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select a Book</h2>
          <div className="grid grid-cols-1 gap-4 mb-4">
            {books.map((book) => (
              <div 
                key={book.id}
                className={`p-4 border rounded cursor-pointer ${selectedBook?.id === book.id ? 'border-blue-500 bg-blue-50' : ''}`}
                onClick={() => setSelectedBook(book)}
              >
                <h3 className="font-semibold">{book.title}</h3>
                <p className="text-sm text-gray-600">Author: {book.author || 'Unknown'}</p>
                {book.about && (
                  <p className="text-sm text-gray-600 truncate">
                    {book.about.substring(0, 100)}...
                  </p>
                )}
              </div>
            ))}
          </div>
          
          {selectedBook && (
            <div className="flex space-x-2">
              <button
                onClick={saveBookToTurboPuffer}
                disabled={loading || !selectedBook}
                className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
              >
                {operation === 'save' && loading ? 'Saving...' : 'Save to TurboPuffer'}
              </button>
              
              <button
                onClick={searchSimilarBooks}
                disabled={loading || !selectedBook}
                className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
              >
                {operation === 'search' && loading ? 'Searching...' : 'Find Similar Books'}
              </button>
            </div>
          )}
        </div>
      )}
      
      {loading && (
        <div className="p-4 bg-gray-100 rounded-md mb-4">
          <p className="text-center">
            {operation === 'fetch' ? 'Fetching books...' : 
             operation === 'save' ? 'Saving book to TurboPuffer...' : 
             operation === 'search' ? 'Searching for similar books...' : 
             'Loading...'}
          </p>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md mb-4">
          <h3 className="font-semibold">Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          {result.message && (
            <div className="bg-green-100 p-3 rounded-md mb-4">
              <p className="text-green-800">{result.message}</p>
            </div>
          )}
          <pre className="p-4 bg-gray-100 rounded-md overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 