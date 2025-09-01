"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, BrainCircuit, Smile, Frown, Meh, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { processVoiceJournal, type ProcessVoiceJournalOutput } from '@/ai/flows/process-voice-journal';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type RecordingState = 'idle' | 'recording' | 'processing' | 'finished';

const moodIcons = {
  Positive: <Smile className="h-5 w-5 text-green-500" />,
  Neutral: <Meh className="h-5 w-5 text-yellow-500" />,
  Negative: <Frown className="h-5 w-5 text-red-500" />,
};

export default function VoiceJournalPage() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ProcessVoiceJournalOutput | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaRecorder]);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      setMediaRecorder(recorder);
      
      recorder.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };

      recorder.onstart = () => {
        setRecordingState('recording');
        setAnalysisResult(null);
        setAudioChunks([]);
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
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
      if(timerRef.current) clearInterval(timerRef.current);
      setRecordingState('processing');
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const result = await processVoiceJournal({ audioDataUri: base64Audio });
            setAnalysisResult(result);
            setRecordingState('finished');
          };
        } catch (error) {
          console.error('Error processing voice journal:', error);
          toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: 'There was an error analyzing your journal entry. Please try again.',
          });
          setRecordingState('idle');
        }
      };
    }
  };
  
  const handleRecordButtonClick = () => {
    if (recordingState === 'recording') {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Voice Journal</CardTitle>
          <CardDescription>
            Record your thoughts and let our AI provide insights into your state of mind.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <Button 
            onClick={handleRecordButtonClick} 
            size="lg" 
            className="w-40"
            disabled={recordingState === 'processing'}
          >
            {recordingState === 'recording' ? (
              <>
                <Square className="mr-2 h-5 w-5" /> Stop
              </>
            ) : (
              <>
                <Mic className="mr-2 h-5 w-5" /> Record
              </>
            )}
          </Button>
          
          {recordingState === 'recording' && (
            <div className="text-lg font-mono animate-pulse text-red-500">{formatTime(recordingTime)}</div>
          )}

          {recordingState === 'processing' && (
            <div className="flex items-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </div>
          )}
        </CardContent>
      </Card>

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <BrainCircuit className="h-6 w-6" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">Mood:</h3>
                <Badge variant="outline" className="flex items-center gap-2 text-base px-3 py-1">
                  {moodIcons[analysisResult.mood]}
                  <span>{analysisResult.mood}</span>
                </Badge>
              </div>
            <Alert>
              <AlertTitle className="font-semibold">Summary</AlertTitle>
              <AlertDescription>
                {analysisResult.summary}
              </AlertDescription>
            </Alert>
            <div>
              <h3 className="text-lg font-semibold mb-2">Transcription:</h3>
              <p className="text-muted-foreground leading-relaxed">
                {analysisResult.transcription}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {recordingState === 'idle' && !analysisResult && (
         <div className="text-center text-muted-foreground py-16">
            <Mic className="mx-auto h-16 w-16" />
            <p className="mt-4 text-lg">Click "Record" to start your voice journal entry.</p>
         </div>
      )}

    </div>
  );
}
