
"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Bot, User, Volume2, Waves } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAiCoachResponse, type GetAiCoachResponseOutput } from '@/ai/flows/get-ai-coach-response';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type RecordingState = 'idle' | 'recording' | 'processing' | 'finished';

interface ConversationTurn {
  speaker: 'user' | 'coach';
  text: string;
  audioUri?: string;
}

export default function AiCoachPage() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaRecorder]);
  
  const startRecording = async () => {
    setConversation([]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      setMediaRecorder(recorder);
      
      const audioChunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstart = () => {
        setRecordingState('recording');
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const result = await getAiCoachResponse({ audioDataUri: base64Audio });
            setConversation([
              { speaker: 'user', text: result.userQuery },
              { speaker: 'coach', text: result.coachResponseText, audioUri: result.coachResponseAudioUri }
            ]);
            setRecordingState('finished');
            // Auto-play the coach's response
            if (audioRef.current && result.coachResponseAudioUri) {
                audioRef.current.src = result.coachResponseAudioUri;
                audioRef.current.play().catch(e => console.error("Audio autoplay failed:", e));
            }
          };
        } catch (error) {
          console.error('Error processing AI coach request:', error);
          toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: 'There was an error communicating with the AI coach. Please try again.',
          });
          setRecordingState('idle');
        }
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
      setRecordingState('processing');
    }
  };
  
  const handleRecordButtonClick = () => {
    if (recordingState === 'recording') {
      stopRecording();
    } else {
      startRecording();
    }
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
        <CardContent className="flex flex-col items-center gap-6">
          <Button 
            onClick={handleRecordButtonClick} 
            size="lg" 
            className={cn("w-40 transition-all duration-300", 
              recordingState === 'recording' ? 'bg-destructive hover:bg-destructive/90' : ''
            )}
            disabled={recordingState === 'processing'}
          >
            {recordingState === 'recording' ? (
              <>
                <Square className="mr-2 h-5 w-5" /> Stop
              </>
            ) : (
              <>
                <Mic className="mr-2 h-5 w-5" /> Ask Coach
              </>
            )}
          </Button>
          
          {recordingState === 'recording' && (
            <div className="flex items-center text-red-500 animate-pulse">
                <Waves className="mr-2 h-5 w-5" />
                <span>Listening...</span>
            </div>
          )}

          {recordingState === 'processing' && (
            <div className="flex items-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Thinking...
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {conversation.length > 0 ? (
          conversation.map((turn, index) => (
            <div key={index} className={cn("flex items-start gap-3", turn.speaker === 'user' ? 'justify-end' : 'justify-start')}>
              {turn.speaker === 'coach' && (
                <Avatar>
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
              )}
              <div className={cn("rounded-lg p-3 max-w-sm md:max-w-md", 
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
            recordingState === 'idle' && (
                <div className="text-center text-muted-foreground py-16">
                    <Bot className="mx-auto h-16 w-16" />
                    <p className="mt-4 text-lg">Click "Ask Coach" to start a conversation.</p>
                </div>
            )
        )}
      </div>
    </div>
  );
}
