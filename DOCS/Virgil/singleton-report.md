# Service Singleton Refactoring Plan

## Purpose

This document outlines the implementation plan for ensuring consistent use of singleton service instances throughout the application. The primary goal is to prevent redundant initialization of services, maintain consistent state, and properly manage dependencies like `SupabaseClient`.

## Files That Need to Be Updated

### 1. Create New Context Files

#### `/src/contexts/ServicesContext.tsx` (New file)
- **Why**: Create a new React Context to provide service instances throughout the app
- **Purpose**: Will expose both AIService and ConversationManager instances through a hook

### 2. Update/Understand Services

#### `/src/services/AIService.ts`
- **Why**: Already exports a singleton instance, but components importing it directly need to be updated
- **Purpose**: No changes needed to the file itself, but we need to include it in our new context

#### `/src/services/ConversationManager.ts`
- **Why**: Currently defined as a class without a singleton instance, needs to be properly instantiated with the Supabase client
- **Purpose**: Will be instantiated within the ServicesProvider component when Supabase client is available

### 3. Update App Entry Point

#### `/src/App.tsx`
- **Why**: Need to wrap appropriate parts of the component tree with the new `ServicesProvider`
- **Purpose**: Position the provider inside the `<AuthProvider>` (which provides the Supabase client)

### 4. Update Service Consumers

#### `/src/hooks/useVirgilChat.ts`
- **Why**: Currently imports AIService and ConversationManager directly
- **Purpose**: Replace direct imports with the useServices hook

#### `/src/components/survey/AIChatDialog.tsx`
- **Why**: Currently imports AIService and ConversationManager directly
- **Purpose**: Replace direct imports with the useServices hook

#### `/src/components/virgil/VirgilChatInterface.tsx`
- **Why**: Likely imports or uses chat services, confirmed this file exists
- **Purpose**: Replace direct service imports with the useServices hook

#### `/src/components/reader/VirgilChat.tsx`
- **Why**: Confirmed this file exists, likely uses chat services
- **Purpose**: Replace direct service imports with the useServices hook

#### `/src/pages/DNAAssessment.tsx`
- **Why**: Imports ConversationManager directly
- **Purpose**: Replace direct import with the useServices hook

#### `/src/pages/VirgilWelcome.tsx`
- **Why**: Imports ConversationManager directly
- **Purpose**: Replace direct import with the useServices hook

### 5. Find and Update Additional Consumers

All other files that directly import either service should be updated:

1. Search for all imports of AIService
   - Grep pattern: `import.*AIService`
   
2. Search for all imports of ConversationManager
   - Grep pattern: `import.*ConversationManager`
   
3. For each file found:
   - Update to use the new context via the useServices hook
   - Handle potential null value for conversationManager during initialization

## Implementation Details

### ServicesContext Implementation

```typescript
// src/contexts/ServicesContext.tsx
import React, { createContext, useContext } from 'react';
import { aiService } from '@/services/AIService'; // Import existing singleton
import { ConversationManager } from '@/services/ConversationManager'; // Import class
import { useAuth } from '@/contexts/SupabaseAuthContext'; // For Supabase client access

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
    if (supabase) {
      return new ConversationManager(supabase);
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
```

### App.tsx Update

```tsx
// In App.tsx
import { ServicesProvider } from '@/contexts/ServicesContext';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ServicesProvider> {/* Insert ServicesProvider inside AuthProvider */}
          <ProfileDataProvider>
            <ThemeProvider>
              {/* ... rest of the app ... */}
            </ThemeProvider>
          </ProfileDataProvider>
        </ServicesProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
```

### Example Consumer Update

```tsx
// Before:
import aiService from '@/services/AIService';
import conversationManager from '@/services/ConversationManager';

// After:
import { useServices } from '@/contexts/ServicesContext';

const Component = () => {
  const { aiService, conversationManager } = useServices();
  
  // Handle possible null conversationManager during initialization
  useEffect(() => {
    if (!conversationManager) {
      console.warn("ConversationManager not yet available");
      return;
    }
    // Now safe to use conversationManager
    // ...
  }, [conversationManager]);
  
  // ...
};
```

## Benefits of This Approach

1. **Single Instance**: Guarantees only one instance of each service across the application
2. **Proper Dependency Injection**: ConversationManager gets the Supabase client properly
3. **Lazy Initialization**: Services are initialized only when their dependencies are available
4. **Type Safety**: Proper typing for all service methods and properties
5. **Testability**: Makes mocking services for tests straightforward
