import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Mic, MicOff } from "lucide-react";

type DNACategory = Database["public"]["Enums"]["dna_category"];

const categoryOrder: DNACategory[] = [
  "ETHICS",
  "EPISTEMOLOGY",
  "POLITICS",
  "THEOLOGY",
  "ONTOLOGY",
  "AESTHETICS"
];

const TOTAL_QUESTIONS = 30; // 5 questions per category × 6 categories

interface AudioRecorderConfig {
  onAudioData: (audioData: Float32Array) => void;
}

class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private config: AudioRecorderConfig) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.config.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

const DNAAssessment = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPosition, setCurrentPosition] = React.useState("Q1");
  const [currentQuestionNumber, setCurrentQuestionNumber] = React.useState(1);
  const [showExitAlert, setShowExitAlert] = React.useState(false);
  const [answers, setAnswers] = React.useState<string>("");
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [assessmentId, setAssessmentId] = React.useState<string | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);

  const encodeAudioData = (float32Array: Float32Array): string => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  };

  const setupVoiceConnection = async () => {
    try {
      console.log('Setting up voice connection...');

      const { data: response, error: invokeError } = await supabase.functions.invoke('realtime-chat');
      
      if (invokeError) {
        console.error('Edge function error:', invokeError);
        throw new Error(`Edge function error: ${invokeError.message}`);
      }

      if (!response?.token) {
        console.error('Invalid response:', response);
        throw new Error('Failed to get token from edge function');
      }

      peerConnectionRef.current = new RTCPeerConnection();
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      peerConnectionRef.current.addTrack(mediaStream.getTracks()[0], mediaStream);

      dataChannelRef.current = peerConnectionRef.current.createDataChannel('oai-events');
      
      dataChannelRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received event:', data);

        if (data.type === 'response.audio.delta') {
          setIsSpeaking(true);
        } else if (data.type === 'response.audio.done') {
          setIsSpeaking(false);
        } else if (data.type === 'response.function_call_arguments.done') {
          const args = JSON.parse(data.arguments);
          if (args.response === 'A') {
            handleAnswer('A');
          } else if (args.response === 'B') {
            handleAnswer('B');
          }
        }
      };

      peerConnectionRef.current.ontrack = (event) => {
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = event.streams[0];
        }
      };

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${response.token}`,
          "Content-Type": "application/sdp"
        },
        body: offer.sdp
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        throw new Error('Failed to connect to OpenAI');
      }

      const sdpAnswer = await sdpResponse.text();
      const answer = { type: 'answer' as RTCSdpType, sdp: sdpAnswer };
      await peerConnectionRef.current.setRemoteDescription(answer);

      recorderRef.current = new AudioRecorder({
        onAudioData: (audioData) => {
          if (dataChannelRef.current?.readyState === 'open') {
            dataChannelRef.current.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: encodeAudioData(audioData)
            }));
          }
        }
      });

      await recorderRef.current.start();
      setIsVoiceEnabled(true);

    } catch (error) {
      console.error('Error setting up voice:', error);
      toast.error(error instanceof Error ? error.message : "Failed to setup voice interaction");
      stopVoiceConnection();
    }
  };

  const stopVoiceConnection = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsVoiceEnabled(false);
    setIsSpeaking(false);
  };

  const initAnalysis = async (answers: Record<string, string>, assessmentId: string) => {
    console.log('Starting DNA analysis...');

    // Analyze section 1: Theology & Ontology
    try {
      const { error: section1Error } = await supabase.functions.invoke('analyze-dna', {
        body: {
          answers_json: JSON.stringify(answers),
          section: 1,
          assessment_id: assessmentId
        }
      });

      if (section1Error) {
        console.error('Error analyzing DNA results section 1:', section1Error);
        throw section1Error;
      }

      // Analyze section 2: Epistemology & Ethics
      const { error: section2Error } = await supabase.functions.invoke('analyze-dna', {
        body: {
          answers_json: JSON.stringify(answers),
          section: 2,
          assessment_id: assessmentId
        }
      });

      if (section2Error) {
        console.error('Error analyzing DNA results section 2:', section2Error);
        throw section2Error;
      }

      // Analyze section 3: Politics & Aesthetics
      const { error: section3Error } = await supabase.functions.invoke('analyze-dna', {
        body: {
          answers_json: JSON.stringify(answers),
          section: 3,
          assessment_id: assessmentId
        }
      });

      if (section3Error) {
        console.error('Error analyzing DNA results section 3:', section3Error);
        throw section3Error;
      }

    } catch (error) {
      console.error('Error in DNA analysis:', error);
      toast.error('Error analyzing results');
    }
  };

  const upperCategory = category?.toUpperCase() as DNACategory;

  const currentCategoryIndex = categoryOrder.findIndex(cat => cat === upperCategory);
  const nextCategory = currentCategoryIndex < categoryOrder.length - 1 
    ? categoryOrder[currentCategoryIndex + 1] 
    : null;

  const progressPercentage = (currentQuestionNumber / TOTAL_QUESTIONS) * 100;

  React.useEffect(() => {
    const initializeAssessment = async () => {
      if (!assessmentId && currentCategoryIndex === 0) {
        try {
          setIsInitializing(true);
          const name = sessionStorage.getItem('dna_assessment_name') || 'Anonymous';
          
          const { data: newAssessment, error: createError } = await supabase
            .from('dna_assessment_results')
            .insert([{ 
              name,
              answers: {},
              ethics_sequence: '',
              epistemology_sequence: '',
              politics_sequence: '',
              theology_sequence: '',
              ontology_sequence: '',
              aesthetics_sequence: ''
            }])
            .select()
            .maybeSingle();

          if (createError) {
            console.error('Error creating assessment:', createError);
            toast.error('Error starting assessment');
            return;
          }

          if (!newAssessment) {
            console.error('No assessment created');
            toast.error('Error creating assessment');
            return;
          }

          setAssessmentId(newAssessment.id);
          console.log('Created new assessment with ID:', newAssessment.id);
          
          const { data: verifyData, error: verifyError } = await supabase
            .from('dna_assessment_results')
            .select('*')
            .eq('id', newAssessment.id)
            .maybeSingle();

          if (verifyError || !verifyData) {
            console.error('Error verifying assessment:', verifyError);
            toast.error('Error verifying assessment');
            return;
          }

          console.log('Verified assessment exists:', verifyData);
        } catch (error) {
          console.error('Error in assessment initialization:', error);
          toast.error('Error initializing assessment');
        } finally {
          setIsInitializing(false);
        }
      } else {
        setIsInitializing(false);
      }
    };

    initializeAssessment();
  }, [assessmentId, currentCategoryIndex]);

  const { data: currentQuestion, isLoading: questionLoading } = useQuery({
    queryKey: ['dna-question', upperCategory, currentPosition],
    queryFn: async () => {
      console.log('Fetching question for:', { upperCategory, currentPosition });
      
      if (!upperCategory) {
        throw new Error('Category is required');
      }

      const { data, error } = await supabase
        .from('dna_tree_structure')
        .select(`
          *,
          question:great_questions!dna_tree_structure_question_id_fkey (
            question,
            category_number,
            answer_a,
            answer_b
          )
        `)
        .eq('category', upperCategory)
        .eq('tree_position', currentPosition)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching question:', error);
        throw error;
      }
      
      if (!data) {
        console.error('No question found for:', { upperCategory, currentPosition });
        throw new Error('Question not found');
      }

      console.log('Found question:', data);
      return data;
    },
    enabled: !!upperCategory && !isTransitioning && !isInitializing,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  React.useEffect(() => {
    const prefetchNextQuestions = async () => {
      if (!currentQuestion) return;

      console.log('Starting to prefetch next possible questions');

      const nextQuestionIds = [
        currentQuestion.next_question_a_id,
        currentQuestion.next_question_b_id
      ].filter(Boolean);

      for (const nextId of nextQuestionIds) {
        try {
          const { data: nextQuestion } = await supabase
            .from('dna_tree_structure')
            .select('tree_position, category')
            .eq('id', nextId)
            .maybeSingle();

          if (nextQuestion) {
            await queryClient.prefetchQuery({
              queryKey: ['dna-question', nextQuestion.category, nextQuestion.tree_position],
              queryFn: async () => {
                const { data, error } = await supabase
                  .from('dna_tree_structure')
                  .select(`
                    *,
                    question:great_questions!dna_tree_structure_question_id_fkey (
                      question,
                      category_number,
                      answer_a,
                      answer_b
                    )
                  `)
                  .eq('category', nextQuestion.category)
                  .eq('tree_position', nextQuestion.tree_position)
                  .maybeSingle();

                if (error) throw error;
                console.log(`Prefetched question: ${nextQuestion.category} - ${nextQuestion.tree_position}`);
                return data;
              },
              staleTime: 5 * 60 * 1000,
            });
          }
        } catch (error) {
          console.error('Error prefetching next question:', error);
        }
      }
    };

    prefetchNextQuestions();
  }, [currentQuestion, queryClient]);

  const handleAnswer = async (answer: "A" | "B") => {
    if (!currentQuestion || !assessmentId) return;

    const newAnswers = answers + answer;
    setAnswers(newAnswers);

    try {
      console.log('Storing question response:', {
        assessment_id: assessmentId,
        category: upperCategory,
        question_id: currentQuestion.id,
        answer
      });

      const { error: responseError } = await supabase
        .from('dna_question_responses')
        .insert({
          assessment_id: assessmentId,
          category: upperCategory,
          question_id: currentQuestion.id,
          answer
        });

      if (responseError) {
        console.error('Error storing question response:', responseError);
        toast.error('Error saving your answer');
        return;
      }

      const nextQuestionId = answer === "A" 
        ? currentQuestion.next_question_a_id 
        : currentQuestion.next_question_b_id;

      if (!nextQuestionId) {
        setIsTransitioning(true);

        try {
          const { data: currentData, error: fetchError } = await supabase
            .from('dna_assessment_results')
            .select('answers')
            .eq('id', assessmentId)
            .maybeSingle();

          if (fetchError) {
            console.error('Error fetching current answers:', fetchError);
            toast.error('Error updating results');
            return;
          }

          const currentAnswers = (currentData?.answers as Record<string, string>) || {};
          const updatedAnswers = {
            ...currentAnswers,
            [upperCategory]: newAnswers
          };

          const sequenceColumnName = `${upperCategory.toLowerCase()}_sequence` as const;
          const updateData = {
            answers: updatedAnswers,
            [sequenceColumnName]: newAnswers
          };

          console.log('Updating assessment with:', updateData);

          const { error: updateError } = await supabase
            .from('dna_assessment_results')
            .update(updateData)
            .eq('id', assessmentId);

          if (updateError) {
            console.error('Error updating assessment results:', updateError);
            toast.error('Error saving category results');
            return;
          }

          if (!nextCategory) {
            console.log('Assessment complete, navigating to results...');
            
            navigate('/dna');
            
            toast.success('Assessment completed! View your results below', {
              duration: 3000
            });

            await initAnalysis(updatedAnswers, assessmentId);
          } else {
            await queryClient.prefetchQuery({
              queryKey: ['dna-question', nextCategory, 'Q1'],
              queryFn: async () => {
                const { data, error } = await supabase
                  .from('dna_tree_structure')
                  .select(`
                    *,
                    question:great_questions!dna_tree_structure_question_id_fkey (
                      question,
                      category_number,
                      answer_a,
                      answer_b
                    )
                  `)
                  .eq('category', nextCategory)
                  .eq('tree_position', 'Q1')
                  .maybeSingle();

                if (error) throw error;
                return data;
              },
            });

            navigate(`/dna/${nextCategory.toLowerCase()}`);
            setCurrentPosition("Q1");
            setCurrentQuestionNumber(prev => prev + 1);
            setAnswers("");
          }
        } catch (error) {
          console.error('Error updating assessment:', error);
          toast.error('Error saving your progress');
          if (!nextCategory) {
            navigate('/dna');
          }
        } finally {
          setIsTransitioning(false);
        }
        return;
      }

      try {
        const { data: nextQuestion, error: nextQuestionError } = await supabase
          .from('dna_tree_structure')
          .select('tree_position')
          .eq('id', nextQuestionId)
          .maybeSingle();

        if (nextQuestionError) {
          console.error('Error fetching next question:', nextQuestionError);
          return;
        }

        if (!nextQuestion) {
          console.error('Next question not found for ID:', nextQuestionId);
          return;
        }

        setCurrentPosition(nextQuestion.tree_position);
        setCurrentQuestionNumber(prev => prev + 1);
      } catch (error) {
        console.error('Error in question transition:', error);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
      toast.error('Error processing your answer');
    }
  };

  const handleExit = () => {
    setShowExitAlert(true);
  };

  const confirmExit = () => {
    navigate('/dna');
    setShowExitAlert(false);
  };

  if (questionLoading || isTransitioning || isInitializing) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
        <header className="sticky top-0 px-4 py-3 flex items-center justify-between relative z-50 bg-background">
          <div className="h-10 w-10" />
          <div className="flex items-center gap-1 text-sm font-oxanium text-foreground mr-3">
            <span>{currentQuestionNumber}</span>
            <span>/</span>
            <span>{TOTAL_QUESTIONS}</span>
          </div>
        </header>
        <div className="px-4">
          <Progress 
            value={progressPercentage}
            className="bg-secondary/10"
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="font-oxanium text-lg">
            {isInitializing ? 'Initializing assessment...' : 'Loading next question...'}
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground">
        <header className="sticky top-0 px-4 py-3 relative z-50 bg-background">
          <button 
            onClick={handleExit}
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-all duration-300 border-2 border-transparent hover:border-transparent active:border-transparent relative before:absolute before:inset-[-2px] before:rounded-md before:bg-gradient-to-r before:from-[#9b87f5] before:to-[#7E69AB] before:opacity-0 hover:before:opacity-100 after:absolute after:inset-0 after:rounded-[4px] after:bg-[#2A282A] after:z-[0] hover:after:bg-[#2A282A]/90 [&>*]:relative [&>*]:z-[1]"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-4rem)] px-4">
          <h1 className="text-2xl font-oxanium text-center mb-8">
            Question not found
          </h1>
          <Button
            variant="outline"
            onClick={handleExit}
            className="px-8 py-2 text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-all duration-300 font-oxanium border-2 border-transparent hover:border-transparent active:border-transparent relative before:absolute before:inset-[-2px] before:rounded-md before:bg-gradient-to-r before:from-[#9b87f5] before:to-[#7E69AB] before:opacity-0 hover:before:opacity-100 after:absolute after:inset-0 after:rounded-[4px] after:bg-[#2A282A] after:z-[0] hover:after:bg-[#2A282A]/90 [&>span]:relative [&>span]:z-[1]"
          >
            <span>GO BACK</span>
          </Button>
        </div>
      </div>
    );
  }

  const buttonTextA = currentQuestion.question?.answer_a || "Yes";
  const buttonTextB = currentQuestion.question?.answer_b || "No";

  const buttonGradientStyles = "text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-all duration-300 font-oxanium border-2 border-transparent hover:border-transparent active:border-transparent relative before:absolute before:inset-[-2px] before:rounded-md before:bg-gradient-to-r before:from-[#9b87f5] before:to-[#7E69AB] before:opacity-0 hover:before:opacity-100 after:absolute after:inset-0 after:rounded-[4px] after:bg-[#2A282A] after:z-[0] hover:after:bg-[#2A282A]/90 [&>span]:relative [&>span]:z-[1]";

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      <header className="sticky top-0 px-4 py-3 flex items-center justify-between relative z-50 bg-background">
        <button 
          onClick={handleExit}
          className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-all duration-300 border-2 border-transparent hover:border-transparent active:border-transparent relative before:absolute before:inset-[-2px] before:rounded-md before:bg-gradient-to-r before:from-[#9b87f5] before:to-[#7E69AB] before:opacity-0 hover:before:opacity-100 after:absolute after:inset-0 after:rounded-[4px] after:bg-[#2A282A] after:z-[0] hover:after:bg-[#2A282A]/90 [&>*]:relative [&>*]:z-[1]"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm font-oxanium text-foreground mr-3">
            <span>{currentQuestionNumber}</span>
            <span>/</span>
            <span>{TOTAL_QUESTIONS}</span>
          </div>
          <Button
            onClick={isVoiceEnabled ? stopVoiceConnection : setupVoiceConnection}
            variant="outline"
            size="icon"
            className={buttonGradientStyles}
          >
            <span>{isVoiceEnabled ? <Mic className="h-5 w-5 text-green-500" /> : <MicOff className="h-5 w-5" />}</span>
          </Button>
        </div>
      </header>
      <div className="px-4">
        <Progress 
          value={progressPercentage}
          className="bg-secondary/10"
        />
      </div>
      <div className="flex-1 flex flex-col px-4 relative h-[calc(100dvh-5rem)]">
        <div className="flex-1 flex items-center justify-center py-8 mb-20">
          <h1 className="text-3xl font-baskerville text-center max-w-2xl">
            {currentQuestion.question?.question}
          </h1>
        </div>
        <div className="absolute left-1/2 bottom-24 -translate-x-1/2 flex justify-center gap-4 w-full max-w-lg px-4">
          <Button
            variant="outline"
            className={`${buttonGradientStyles} w-40`}
            onClick={() => handleAnswer("A")}
          >
            <span>{buttonTextA}</span>
          </Button>
          <Button
            variant="outline"
            className={`${buttonGradientStyles} w-40`}
            onClick={() => handleAnswer("B")}
          >
            <span>{buttonTextB}</span>
          </Button>
        </div>
      </div>

      {isVoiceEnabled && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
          <div className={`inline-block px-4 py-2 rounded-full transition-colors ${
            isSpeaking ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
          }`}>
            {isSpeaking ? 'AI is speaking...' : 'Listening...'}
          </div>
        </div>
      )}

      <AlertDialog open={showExitAlert} onOpenChange={setShowExitAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-oxanium">Are you sure you want to exit?</AlertDialogTitle>
            <AlertDialogDescription className="font-oxanium">
              Your progress will not be saved and you will need to retake the assessment from the beginning.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={`${buttonGradientStyles}`}>
              <span>Cancel</span>
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmExit}
              className={`${buttonGradientStyles}`}
            >
              <span>Exit Assessment</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DNAAssessment;
