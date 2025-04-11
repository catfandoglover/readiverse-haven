import React, { createContext, useContext } from 'react';
import { aiService } from '@/services/AIService'; // Import existing singleton
import { ConversationManager } from '@/services/ConversationManager'; // Import class
import { useAuth } from '@/contexts/SupabaseAuthContext'; // For Supabase client access
import { SupabaseClient } from '@supabase/supabase-js';

interface AppServices {
  aiService: typeof aiService; // Type is the instance type
  conversationManager: ConversationManager | null; // Instance type, initially null
}

const ServicesContext = createContext<AppServices>({
  aiService: aiService, // Provide imported singleton directly
  conversationManager: null, // Default to null before provider initializes
});

export const useServices = () => useContext(ServicesContext);

interface ServicesProviderProps {
  children: React.ReactNode;
}

export const ServicesProvider: React.FC<ServicesProviderProps> = ({ children }) => {
  const { supabase } = useAuth(); // Get Supabase client from auth context
  
  // Instantiate ConversationManager only when client is available
  // Use useMemo to ensure it's only created once per client instance
  const conversationManager = React.useMemo(() => {
    // Remove the problematic check: `typeof supabase.from === 'function'`
    // Rely on supabase being truthy (a valid client instance or null/undefined)
    if (supabase) {
      // Pass the client which should be SupabaseClient<any> or properly typed
      return new ConversationManager(supabase as SupabaseClient); // Still need SupabaseClient type here for the constructor
    } 
    return null; // Return null if client isn't ready
  }, [supabase]);
  
  // The value provided by the context
  const value = {
    aiService, // The already existing singleton
    conversationManager, // The newly created instance (or null)
  };
  
  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
}; 
