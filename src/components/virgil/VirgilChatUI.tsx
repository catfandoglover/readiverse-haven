import React from 'react';
import { ChatMessage } from '@/types/chat'; // Correctly import ChatMessage
import { ThemeColors } from './VirgilChatThemes';

interface VirgilChatUIProps {
  messages: ChatMessage[]; // Use the imported ChatMessage type
  inputMessage: string;
  isRecording: boolean;
  isProcessing: boolean; // For general processing (transcription, AI response)
  isLoading: boolean;    // For loading history or prompt
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmitMessage: (e: React.FormEvent) => void;
  toggleRecording: () => void;
  cancelRecording: () => void;
  themeColors: ThemeColors;
}

const VirgilChatUI: React.FC<VirgilChatUIProps> = ({
  messages,
  inputMessage,
  isRecording,
  isProcessing,
  isLoading,
  handleInputChange,
  handleSubmitMessage,
  toggleRecording,
  cancelRecording,
  themeColors,
}) => {
  if (isLoading) {
    // Handled by wrapper, but could show an inline loading indicator too
    return <div className="p-4">Loading chat...</div>;
  }

  return (
    <div className={`flex flex-col h-full ${themeColors.background}`}>
      {/* Message display area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${themeColors.text}`}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-3 rounded-lg max-w-xl ${message.role === 'user' 
                  ? themeColors.userMessageBg 
                  : themeColors.assistantMessageBg}`}
            >
              <p className={`${themeColors.text}`}>{message.content}</p>
              {/* Basic audio player if URL exists - Replace with a proper component */}
              {message.audioUrl && (
                <audio controls src={message.audioUrl} className="mt-2 w-full h-8"></audio>
              )}
            </div>
          </div>
        ))}
        {/* Display thinking/processing indicator */}
        {(isProcessing && !isRecording) && (
          <div className="flex justify-start">
             <div className={`p-3 rounded-lg ${themeColors.assistantMessageBg} ${themeColors.text} opacity-75 italic`}>
               Virgil is thinking...
             </div>
           </div>
        )}
      </div>

      {/* Input area */}
      <div className={`p-4 border-t ${themeColors.border} ${themeColors.inputBackground}`}>
        <form onSubmit={handleSubmitMessage} className="flex items-center space-x-2">
          <textarea
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Ask Virgil..."
            className={`flex-1 border ${themeColors.border} ${themeColors.inputBackground} ${themeColors.inputText} ${themeColors.inputPlaceholder} rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={1}
            disabled={isProcessing || isRecording}
          />
          {/* Recording Button */}  
          <button 
            type="button"
            onClick={toggleRecording}
            disabled={isProcessing}
            className={`p-2 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'} ${themeColors.text} transition duration-150 ease-in-out`}
          >
             {/* Basic Mic Icon - Replace with actual SVG/Icon component */} 
             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
          </button>
          {/* Send Button */} 
          <button 
            type="submit"
            disabled={isProcessing || isRecording || !inputMessage.trim()}
            className={`px-4 py-2 bg-blue-500 ${themeColors.text} rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out`}
          >
            Send
          </button>
        </form>
        {isRecording && (
          <button 
            type="button"
            onClick={cancelRecording}
            className={`text-red-500 hover:text-red-700 text-sm mt-1 ${themeColors.text} opacity-80`}
          >
            Cancel Recording
          </button>
        )}
      </div>
    </div>
  );
};

export default VirgilChatUI; 
