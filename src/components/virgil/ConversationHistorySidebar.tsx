
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageCircle, Trash2 } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ConversationHistorySidebar: React.FC<ConversationHistorySidebarProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
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

    if (open) {
      fetchConversations();
    }
  }, [open]);

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
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[320px] bg-[#2A282A] text-[#E9E7E2] border-r border-[#E9E7E2]/10">
        <nav className="flex flex-col gap-8 mt-10">
          <div className="px-2">
            <h2 className="text-xl font-baskerville mb-8">Conversations</h2>
            {loading ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <p className="text-[#E9E7E2]/70">Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-[#E9E7E2]/70 mb-4">No conversations yet.</p>
                <div 
                  className="flex items-center space-x-4 shadow-md rounded-2xl p-3 bg-[#E3E0D9]/20 cursor-pointer hover:bg-[#E3E0D9]/10 transition-colors"
                  onClick={() => onOpenChange(false)}
                >
                  <div className="flex-shrink-0 rounded-full p-3">
                    <div className="h-6 w-6 flex items-center justify-center">
                      <span className="text-lg">💬</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold tracking-wide">
                      Start a new conversation
                    </h3>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {conversations.map((conversation) => (
                  <div 
                    key={conversation.id} 
                    className="group relative flex items-center space-x-4 shadow-md rounded-2xl p-3 bg-[#E3E0D9]/10 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors"
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 h-7 w-7 text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#4A4351]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(conversation.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
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
      </SheetContent>
    </Sheet>
  );
};

export default ConversationHistorySidebar;
