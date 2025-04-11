import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VirgilReaderContextType {
  showVirgilChat: boolean;
  toggleVirgilChat: () => void;
  bookTitle: string;
  shouldMoveContent: boolean;
}

interface VirgilReaderProviderProps {
  children: ReactNode;
  initialTitle?: string;
  shouldMoveContent?: boolean;
}

const defaultContext: VirgilReaderContextType = {
  showVirgilChat: false,
  toggleVirgilChat: () => {},
  bookTitle: "Unknown Book",
  shouldMoveContent: false
};

export const VirgilReaderContext = createContext<VirgilReaderContextType>(defaultContext);

export const useVirgilReader = () => useContext(VirgilReaderContext);

export const VirgilReaderProvider: React.FC<VirgilReaderProviderProps> = ({ 
  children, 
  initialTitle = "Unknown Book",
  shouldMoveContent = false
}) => {
  const [showVirgilChat, setShowVirgilChat] = useState(false);
  const [bookTitle, setBookTitle] = useState(initialTitle);

  const toggleVirgilChat = () => {
    setShowVirgilChat(!showVirgilChat);
  };

  const contextValue = {
    showVirgilChat,
    toggleVirgilChat,
    bookTitle,
    shouldMoveContent
  };

  return (
    <VirgilReaderContext.Provider value={contextValue}>
      {children}
    </VirgilReaderContext.Provider>
  );
};
