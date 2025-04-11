import React, { createContext, useContext, useMemo } from 'react';
import { aiService } from '@/services/AIService'; // Import existing singleton
import { ConversationManager } from '@/services/ConversationManager'; // Import class
import { useAuth } from '@/contexts/SupabaseAuthContext'; // For Supabase client access
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

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
  const conversationManager = useMemo(() => {
    if (supabase) {
      // Pass the client, ensuring it's typed as SupabaseClient<Database>
      // The useAuth hook should ideally provide a typed client.
      // If not, we might need to cast, but let's assume it provides the correct type for now.
      return new ConversationManager(supabase as SupabaseClient<Database>);
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
