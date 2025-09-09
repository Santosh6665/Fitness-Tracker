
"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Bot, User, Volume2, Waves, SendHorizonal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAiCoachResponse, type GetAiCoachResponseOutput } from '@/ai/flows/get-ai-coach-response';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

type ProcessingState = 'idle' | 'recording' | 'processing';

interface ConversationTurn {
  speaker: 'user' | 'coach';
  text: string;
  audioUri?: string;
}

export default function AiCoachPage() {
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [textQuery, setTextQuery] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaRecorder]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      setMediaRecorder(recorder);
      
      const audioChunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstart = () => {
        setProcessingState('recording');
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await handleGetCoachResponse({ audioDataUri: base64Audio });
        };
      };
      
      recorder.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        variant: 'destructive',
        title: 'Microphone Access Denied',
        description: 'Please enable microphone permissions in your browser settings.',
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setProcessingState('processing');
    }
  };
  
  const handleRecordButtonClick = () => {
    if (processingState === 'recording') {
      stopRecording();
    } else {
      setConversation([]);
      startRecording();
    }
  };

  const handleGetCoachResponse = async (input: { audioDataUri?: string; textQuery?: string }) => {
    if (input.textQuery) {
        setConversation([{ speaker: 'user', text: input.textQuery }]);
    }
    setProcessingState('processing');
    try {
        const result = await getAiCoachResponse(input);
        const finalConversation: ConversationTurn[] = [
            { speaker: 'user', text: result.userQuery },
            { speaker: 'coach', text: result.coachResponseText, audioUri: result.coachResponseAudioUri }
        ];

        setConversation(finalConversation);
        
        if (audioRef.current && result.coachResponseAudioUri) {
            audioRef.current.src = result.coachResponseAudioUri;
            audioRef.current.play().catch(e => console.error("Audio autoplay failed:", e));
        }
    } catch (error) {
        console.error('Error processing AI coach request:', error);
        toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: 'There was an error communicating with the AI coach. Please try again.',
        });
        setConversation([]);
    } finally {
        setProcessingState('idle');
    }
  };

  const handleSendTextQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textQuery.trim()) return;
    setConversation([]);
    handleGetCoachResponse({ textQuery });
    setTextQuery('');
  };


  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">AI Fitness Coach</CardTitle>
          <CardDescription>
            Ask me anything about fitness, nutrition, or your workout plan!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-full max-w-lg space-y-4">
             <form onSubmit={handleSendTextQuery} className="flex gap-2">
              <Input
                placeholder="Type your question..."
                value={textQuery}
                onChange={(e) => setTextQuery(e.target.value)}
                disabled={processingState !== 'idle'}
              />
              <Button type="submit" disabled={processingState !== 'idle' || !textQuery.trim()} size="icon">
                <SendHorizonal />
                <span className="sr-only">Send</span>
              </Button>
            </form>

            <div className="relative flex items-center">
                <div className="flex-grow border-t border-muted"></div>
                <span className="flex-shrink mx-4 text-muted-foreground text-xs">OR</span>
                <div className="flex-grow border-t border-muted"></div>
            </div>

             <Button 
                onClick={handleRecordButtonClick} 
                className={cn("w-full transition-all duration-300", 
                  processingState === 'recording' ? 'bg-destructive hover:bg-destructive/90' : ''
                )}
                disabled={processingState === 'processing'}
              >
                {processingState === 'recording' ? (
                  <>
                    <Square className="mr-2 h-5 w-5" /> Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" /> Ask with Voice
                  </>
                )}
              </Button>
          </div>
          
          {processingState === 'recording' && (
            <div className="flex items-center text-red-500 animate-pulse">
                <Waves className="mr-2 h-5 w-5" />
                <span>Listening...</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {processingState === 'processing' ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg">Your coach is thinking...</p>
            </div>
        ) : conversation.length > 0 ? (
          conversation.map((turn, index) => (
            <div key={index} className={cn("flex items-start gap-3", turn.speaker === 'user' ? 'justify-end' : 'justify-start')}>
              {turn.speaker === 'coach' && (
                <Avatar>
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
              )}
              <div className={cn("rounded-lg p-3 max-w-[80%] sm:max-w-sm md:max-w-md", 
                turn.speaker === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                <p>{turn.text}</p>
                {turn.speaker === 'coach' && turn.audioUri && (
                    <div className="mt-2">
                        <audio ref={audioRef} controls src={turn.audioUri} className="w-full h-10" />
                    </div>
                )}
              </div>
              {turn.speaker === 'user' && (
                <Avatar>
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        ) : (
            processingState === 'idle' && (
                <div className="text-center text-muted-foreground py-16">
                    <Bot className="mx-auto h-16 w-16" />
                    <p className="mt-4 text-lg">Ask a question to start a conversation.</p>
                </div>
            )
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

    