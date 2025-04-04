
import React, { createContext, useContext } from 'react';

interface VirgilReaderContextType {
  showVirgilChat: boolean;
  toggleVirgilChat: () => void;
  bookTitle: string;
}

const defaultContext: VirgilReaderContextType = {
  showVirgilChat: false,
  toggleVirgilChat: () => {},
  bookTitle: "Unknown Book"
};

export const VirgilReaderContext = createContext<VirgilReaderContextType>(defaultContext);

export const useVirgilReader = () => useContext(VirgilReaderContext);
