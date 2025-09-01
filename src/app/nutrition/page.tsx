
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Beef, Wheat, Fish, GlassWater, Upload, Sparkles, Loader2, Salad, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeMeal, AnalyzeMealOutput } from "@/ai/flows/analyze-meal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const nutritionData = {
  calories: {
    label: "Calories",
    current: 1850,
    target: 2500,
    unit: "kcal",
    icon: Flame,
    color: "bg-primary",
  },
  protein: {
    label: "Protein",
    current: 120,
    target: 150,
    unit: "g",
    icon: Beef,
    color: "bg-red-500",
  },
  carbs: {
    label: "Carbohydrates",
    current: 200,
    target: 300,
    unit: "g",
    icon: Wheat,
    color: "bg-yellow-500",
  },
  fats: {
    label: "Fats",
    current: 60,
    target: 70,
    unit: "g",
    icon: Fish,
    color: "bg-blue-500",
  },
  water: {
    label: "Water",
    current: 1.5,
    target: 2.5,
    unit: "L",
    icon: GlassWater,
    color: "bg-sky-500",
  },
};

export default function NutritionPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline">Daily Nutrition</CardTitle>
            <CardDescription>Your intake for today.</CardDescription>
          </div>
          <LogMealDialog />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(nutritionData).map((item) => (
            <Card key={item.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.label}
                </CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-headline">
                  {item.current}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}/ {item.target} {item.unit}
                  </span>
                </div>
                <Progress
                  value={(item.current / item.target) * 100}
                  className="mt-2 h-2"
                  aria-label={`${item.label} intake`}
                />
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function LogMealDialog() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeMealOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Clean up the object URL to avoid memory leaks
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const resetState = () => {
    setImageFile(null);
    setImagePreview(null);
    setIsLoading(false);
    setAnalysisResult(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    resetState();
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
        });
        return;
      }
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleAnalyzeMeal = async () => {
    if (!imageFile) {
      toast({
        variant: "destructive",
        title: "No Image Selected",
        description: "Please choose an image of your meal to analyze.",
      });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const base64data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      const result = await analyzeMeal({ imageDataUri: base64data });
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not analyze the meal image. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && resetState()}>
      <DialogTrigger asChild>
        <Button>
          <Salad className="mr-2" /> Log Meal with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Log a Meal with AI</DialogTitle>
          <DialogDescription>
            Upload a photo of your meal and our AI will analyze its nutritional content.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            id="meal-image"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          {imagePreview ? (
            <div className="relative group">
              <Image src={imagePreview} alt="Meal preview" width={400} height={300} className="rounded-md w-full object-cover aspect-video" />
               <Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  setAnalysisResult(null);
                  if(fileInputRef.current) fileInputRef.current.value = "";
               }}>
                  <X className="h-4 w-4" />
               </Button>
            </div>
          ) : (
             <Button
              variant="outline"
              className="w-full flex flex-col h-32 items-center justify-center gap-2 border-dashed"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-muted-foreground">Click to upload an image</span>
            </Button>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center text-muted-foreground p-4">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing your meal...
            </div>
          ) : analysisResult ? (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle className="font-headline">AI Analysis Complete</AlertTitle>
              <AlertDescription>
                <p className="font-semibold mb-2">{analysisResult.description}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span><Flame className="inline mr-1 h-4 w-4"/>Calories:</span> <span className="font-medium text-right">{analysisResult.calories} kcal</span>
                  <span><Beef className="inline mr-1 h-4 w-4"/>Protein:</span> <span className="font-medium text-right">{analysisResult.protein} g</span>
                  <span><Wheat className="inline mr-1 h-4 w-4"/>Carbs:</span> <span className="font-medium text-right">{analysisResult.carbs} g</span>
                  <span><Fish className="inline mr-1 h-4 w-4"/>Fats:</span> <span className="font-medium text-right">{analysisResult.fats} g</span>
                </div>
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
        <DialogFooter>
          {analysisResult ? (
             <Button type="button" className="w-full">Add to Daily Log</Button>
          ) : (
            <Button type="button" onClick={handleAnalyzeMeal} disabled={isLoading || !imageFile} className="w-full">
              {isLoading ? 'Analyzing...' : 'Analyze Meal'}
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
