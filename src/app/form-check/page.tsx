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

export default function FormCheckPage() {
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Clean up the object URL to avoid memory leaks
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
            variant: "destructive",
            title: "File too large",
            description: "Please upload a video smaller than 10MB.",
        });
        return;
      }
      setVideoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
      setFeedback(null);
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

      const result = await getAiFormCorrectionFeedback({
        exerciseName: selectedExercise,
        videoDataUri: base64data,
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
            Get instant feedback on your exercise form. Select an exercise, upload a short video, and let our AI coach help you improve.
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
            <p className="text-xs text-muted-foreground">Max file size: 10MB.</p>
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
