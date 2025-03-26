
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/OutsetaAuthContext";

interface Conversation {
  id: string;
  mode_id: string;
  mode_title: string;
  mode_icon: string;
  last_message?: string;
  created_at: string;
  session_id: string;
}

interface ConversationHistorySidebarProps {
  onClose: () => void;
}

const ConversationHistorySidebar: React.FC<ConversationHistorySidebarProps> = ({ 
  onClose 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data, error } = await supabase
          .from('virgil_conversations')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setConversations(data || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to load conversation history');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  const handleDeleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('virgil_conversations')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setConversations(conversations.filter(conv => conv.id !== id));
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    navigate('/virgil-chat', { 
      state: { 
        promptData: {
          id: conversation.mode_id,
          user_title: conversation.mode_title,
          icon_display: conversation.mode_icon,
          session_id: conversation.session_id
        },
        isExistingConversation: true
      }
    });
    onClose();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <div className="p-0 h-full flex flex-col bg-[#332E38] text-[#E9E7E2] rounded-l-2xl">
      <nav className="flex flex-col gap-8 mt-4">
        <div className="px-6">
          <h2 className="text-xl font-serif mb-4">Conversations</h2>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[#E9E7E2]/70">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-center">
                <p className="text-[#E9E7E2]/70 mb-4">No conversations yet.</p>
                <Button 
                  variant="ghost" 
                  onClick={onClose}
                  className="text-[#E9E7E2] hover:bg-[#4A4351]/30 rounded-xl h-12 flex items-center justify-start w-full"
                >
                  <span className="ml-2">Start a new conversation</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center space-x-4 shadow-md rounded-2xl p-3 bg-[#E3E0D9]/10 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors relative group"
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="flex-shrink-0 rounded-full p-2">
                    <div className="h-8 w-8 flex items-center justify-center">
                      <span className="text-xl">{conversation.mode_icon}</span>
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold tracking-wide">
                      {conversation.mode_title}
                    </h3>
                    <p className="text-[#E9E7E2]/60 text-xs truncate mt-1">
                      {conversation.last_message || "Start of conversation"}
                    </p>
                    <p className="text-[#E9E7E2]/40 text-[10px] uppercase tracking-wider mt-1">
                      {formatDate(conversation.created_at)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 absolute top-2 right-2 text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#4A4351]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(conversation.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>
      
      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent className="bg-[#332E38] text-[#E9E7E2] border-[#4A4351]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription className="text-[#E9E7E2]/70">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#4A4351] text-[#E9E7E2] hover:bg-[#4A4351]/30">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => confirmDelete && handleDeleteConversation(confirmDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConversationHistorySidebar;
