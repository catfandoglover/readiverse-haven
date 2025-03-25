import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/OutsetaAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import AIChatDialog from '@/components/survey/AIChatDialog';

interface Question {
  id: number;
  question: string;
  category: string;
  options: string[];
  type: 'single' | 'multiple' | 'text';
}

interface Answer {
  questionId: number;
  answer: string | string[];
}

const DNAAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { user, openLogin } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('identity');
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const { toast } = useToast()

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('dna_questions')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching questions:', error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Failed to load questions. Please try again."
        })
      }

      if (data) {
        setQuestions(data);
        const uniqueCategories = [...new Set(data.map(q => q.category))];
        setCategories(uniqueCategories);
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    if (!user) {
      openLogin();
    }
  }, [user, openLogin]);

  const handleAnswerChange = (questionId: number, answer: string | string[]) => {
    setAnswers(prevAnswers => {
      const existingAnswerIndex = prevAnswers.findIndex(a => a.questionId === questionId);

      if (existingAnswerIndex !== -1) {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = { questionId, answer };
        return updatedAnswers;
      } else {
        return [...prevAnswers, { questionId, answer }];
      }
    });
  };

  const getAnswerForQuestion = (questionId: number): string | string[] | undefined => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer?.answer;
  };

  const handleSubmit = async () => {
    if (!user) {
      openLogin();
      return;
    }

    setIsSubmitting(true);
    try {
      const assessmentData = questions.map(question => {
        const answer = getAnswerForQuestion(question.id);
        return {
          question_id: question.id,
          question_text: question.question,
          answer: answer ? JSON.stringify(answer) : null,
          category: question.category
        };
      });

      const { data: existingAssessment, error: selectError } = await supabase
        .from('user_dna_assessments')
        .select('*')
        .eq('outseta_user_id', user.Uid)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking existing assessment:', selectError);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Failed to submit assessment. Please try again."
        })
        setIsSubmitting(false);
        return;
      }

      if (existingAssessment) {
        const { error: updateError } = await supabase
          .from('user_dna_assessments')
          .update({
            assessment_data: assessmentData,
            updated_at: new Date().toISOString()
          })
          .eq('outseta_user_id', user.Uid);

        if (updateError) {
          console.error('Error updating assessment:', updateError);
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Failed to update assessment. Please try again."
          })
        } else {
          toast({
            title: "Assessment Updated",
            description: "Your assessment has been successfully updated."
          })
          navigate('/discover');
        }
      } else {
        const { error: insertError } = await supabase
          .from('user_dna_assessments')
          .insert({
            outseta_user_id: user.Uid,
            assessment_data: assessmentData,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error submitting assessment:', insertError);
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Failed to submit assessment. Please try again."
          })
        } else {
          toast({
            title: "Assessment Submitted",
            description: "Your assessment has been successfully submitted."
          })
          navigate('/discover');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuestions = questions.filter(q => q.category === currentCategory);

  const handleChatButtonClick = async (question: Question) => {
    if (!user) {
      openLogin();
      return;
    }

    setCurrentQuestion(question.question);
    setIsChatOpen(true);

    if (!chatSessionId) {
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert({
            outseta_user_id: user.Uid,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error creating chat session:', error);
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Failed to start chat session. Please try again."
          })
          setIsChatOpen(false);
          return;
        }

        setChatSessionId(data.id);
      } catch (error) {
        console.error('Unexpected error creating chat session:', error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Failed to start chat session. Please try again."
        })
        setIsChatOpen(false);
      }
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">DNA Assessment</h1>
      {isLoading ? (
        <p>Loading questions...</p>
      ) : (
        <>
          <div className="mb-4">
            <ScrollArea className="w-full whitespace-nowrap pb-4">
              <div className="flex space-x-4">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={currentCategory === category ? 'default' : 'outline'}
                    onClick={() => setCurrentCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Accordion type="single" collapsible>
            {filteredQuestions.map(question => (
              <AccordionItem key={question.id} value={String(question.id)}>
                <AccordionTrigger className="font-bold text-left">{question.question}
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 peer-data-[state=expanded]:rotate-180" />
                </AccordionTrigger>
                <AccordionContent>
                  {question.type === 'single' && question.options && (
                    <div className="grid gap-2">
                      {question.options.map(option => (
                        <div className="grid grid-cols-[1em_1fr] items-start gap-2">
                          <Input
                            type="radio"
                            id={`${question.id}-${option}`}
                            name={`question-${question.id}`}
                            className="h-4 w-4 shrink-0 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            checked={getAnswerForQuestion(question.id) === option}
                            onChange={() => handleAnswerChange(question.id, option)}
                          />
                          <Label htmlFor={`${question.id}-${option}`} className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'multiple' && question.options && (
                    <div className="grid gap-2">
                      {question.options.map(option => (
                        <div className="grid grid-cols-[1em_1fr] items-start gap-2">
                          <Input
                            type="checkbox"
                            id={`${question.id}-${option}`}
                            className="h-4 w-4 shrink-0 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            checked={
                              Array.isArray(getAnswerForQuestion(question.id)) &&
                              getAnswerForQuestion(question.id)?.includes(option)
                            }
                            onChange={(e) => {
                              const currentAnswers = getAnswerForQuestion(question.id) || [];
                              if (Array.isArray(currentAnswers)) {
                                if (e.target.checked) {
                                  handleAnswerChange(question.id, [...currentAnswers, option]);
                                } else {
                                  handleAnswerChange(
                                    question.id,
                                    currentAnswers.filter(ans => ans !== option)
                                  );
                                }
                              }
                            }}
                          />
                          <Label htmlFor={`${question.id}-${option}`} className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'text' && (
                    <Input
                      type="text"
                      value={getAnswerForQuestion(question.id) as string || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    />
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleChatButtonClick(question)}
                    className="mt-2"
                  >
                    Ask Virgil Why
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-4"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
          </Button>

          {/* Make sure AIChatDialog receives the proper props */}
          <AIChatDialog
            open={isChatOpen}
            onOpenChange={setIsChatOpen}
            sessionId={chatSessionId}
            currentQuestion={currentQuestion}
          />
        </>
      )}
    </div>
  );
};

export default DNAAssessment;
