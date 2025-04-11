import React from 'react';
import { useVirgilReader } from '@/contexts/VirgilReaderContext';
import VirgilFullScreenChat from '../virgil/VirgilFullScreenChat';
import SharedVirgilDrawer from '../shared/SharedVirgilDrawer';

interface VirgilDrawerProps {
  bookTitle: string;
}

const VirgilDrawer: React.FC<VirgilDrawerProps> = ({ bookTitle }) => {
  const { showVirgilChat, toggleVirgilChat } = useVirgilReader();

  return (
    <SharedVirgilDrawer
      isOpen={showVirgilChat}
      onClose={toggleVirgilChat}
      theme="dark"
    >
      <VirgilFullScreenChat 
        variant="virgilchat"
        initialMessage={`I'm Virgil, your intellectual guide. We're currently reading "${bookTitle}". How can I assist you with this text?`}
      />
    </SharedVirgilDrawer>
  );
};

export default VirgilDrawer;
