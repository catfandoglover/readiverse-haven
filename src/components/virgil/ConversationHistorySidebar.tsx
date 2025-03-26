
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
    <div className="p-6 h-full flex flex-col bg-[#332E38] text-[#E9E7E2]">
      <h2 className="font-baskerville text-[#E9E7E2] tracking-wider text-lg font-bold mb-6">
        Conversation History
      </h2>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#E9E7E2]/70">Loading conversations...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#E9E7E2]/70 mb-4">No conversations yet.</p>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-[#4A4351] text-[#E9E7E2] hover:bg-[#4A4351]/30 rounded-2xl"
            >
              Start a new conversation
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="p-4 rounded-lg bg-[#4A4351]/30 hover:bg-[#4A4351]/50 cursor-pointer group relative"
              onClick={() => handleSelectConversation(conversation)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-[#4A4351]/50 mr-3">
                  <span className="text-xl">{conversation.mode_icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#E9E7E2]">{conversation.mode_title}</p>
                  <p className="text-sm text-[#E9E7E2]/70 truncate">
                    {conversation.last_message || "Start of conversation"}
                  </p>
                  <p className="text-xs text-[#E9E7E2]/50 mt-1">
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
            </div>
          ))}
        </div>
      )}
      
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
