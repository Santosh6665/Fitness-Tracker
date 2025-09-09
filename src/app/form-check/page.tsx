
"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Upload, Video as VideoIcon } from "lucide-react";
import { getAiFormCorrectionFeedback } from "@/ai/flows/get-ai-form-correction-feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { exercises } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

const trimVideo = (file: File, duration: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      const originalDuration = video.duration;
      const endTime = Math.min(originalDuration, duration);

      const a = document.createElement('a');
      a.href = `${video.src}#t=0,${endTime}`;
      fetch(a.href)
        .then(res => res.blob())
        .then(blob => {
          const trimmedFile = new File([blob], file.name, { type: file.type });
          resolve(trimmedFile);
          URL.revokeObjectURL(video.src);
        })
        .catch(err => {
          reject(err);
          URL.revokeObjectURL(video.src);
        });
    };
    video.onerror = (e) => reject(e);
  });
};


export default function FormCheckPage() {
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) { // Increased size limit for longer videos before trimming
        toast({
            variant: "destructive",
            title: "File too large",
            description: "Please upload a video smaller than 25MB.",
        });
        return;
      }
      
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(file);
      videoElement.onloadedmetadata = async () => {
          window.URL.revokeObjectURL(videoElement.src);
          let finalFile = file;
          if (videoElement.duration > 2) {
              try {
                toast({
                    title: "Trimming video",
                    description: "Your video is longer than 2 seconds and will be trimmed.",
                });
                const response = await fetch(URL.createObjectURL(file));
                const blob = await response.blob();
                finalFile = new File([blob.slice(0, blob.size)], file.name, {type: file.type});
              } catch (e) {
                 toast({ variant: 'destructive', title: 'Could not trim video' });
                 return;
              }
          }

          setVideoFile(finalFile);
          const previewUrl = URL.createObjectURL(finalFile);
          setVideoPreview(previewUrl);
          setFeedback(null);
      };
      videoElement.src = URL.createObjectURL(file);
    }
  };

  const handleGetFeedback = async () => {
    if (!videoFile || !selectedExercise) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select an exercise and upload a video.",
      });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const base64data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(videoFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
      
      const videoDataUri = base64data.split(',')[0].includes('video')
        ? base64data
        : `data:${videoFile.type};base64,${base64data.split(',')[1]}`;


      const result = await getAiFormCorrectionFeedback({
        exerciseName: selectedExercise,
        videoDataUri: videoDataUri,
      });
      setFeedback(result.feedback);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: "Failed to get feedback from AI. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI Form Check</CardTitle>
          <CardDescription>
            Get instant feedback on your exercise form. Select an exercise, upload a short video (max 2s), and let our AI coach help you improve.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="exercise-select">Exercise</label>
            <Select onValueChange={setSelectedExercise} value={selectedExercise}>
              <SelectTrigger id="exercise-select">
                <SelectValue placeholder="Select an exercise" />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((e) => (
                  <SelectItem key={e.name} value={e.name}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="video-upload">Video</label>
            <Input
              id="video-upload"
              type="file"
              accept="video/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {videoFile ? `Selected: ${videoFile.name}` : "Choose a video file"}
            </Button>
            <p className="text-xs text-muted-foreground">Max duration: 2 seconds. Longer videos will be trimmed.</p>
          </div>
          <Button onClick={handleGetFeedback} disabled={isLoading || !videoFile || !selectedExercise} className="w-full">
            {isLoading ? "Analyzing..." : "Get Feedback"}
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <Card className="min-h-[200px]">
          <CardHeader>
            <CardTitle className="font-headline">Your Video</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {videoPreview ? (
              <video src={videoPreview} controls className="w-full rounded-lg" />
            ) : (
              <div className="text-center text-muted-foreground p-8">
                <VideoIcon className="mx-auto h-12 w-12" />
                <p>Your video preview will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {feedback && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle className="font-headline">AI Feedback</AlertTitle>
            <AlertDescription>
              {feedback}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

    