
"use client";

import { useState, useEffect } from "react";
import { Bot, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { progressData, recentWorkouts } from "@/lib/data";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { predictFutureProgress } from "@/ai/flows/predict-future-progress";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AiDailyGoals } from "@/components/dashboard/ai-daily-goals";

function AiForecast() {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetForecast = async () => {
    setIsLoading(true);
    setPrediction(null);
    try {
      const result = await predictFutureProgress({ history: progressData });
      setPrediction(result.prediction);
    } catch (error) {
      console.error("Failed to get forecast:", error);
      toast({
        variant: "destructive",
        title: "Prediction Failed",
        description: "Could not generate AI forecast. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">AI Forecast</CardTitle>
        <CardDescription>
          Predict your future fitness progress.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[8rem] flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing trends...
          </div>
        ) : prediction ? (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Future You</AlertTitle>
            <AlertDescription>{prediction}</AlertDescription>
          </Alert>
        ) : (
          <div className="text-center text-muted-foreground">
            <Bot className="h-8 w-8 mx-auto mb-2" />
            <p>Click below to predict your progress.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleGetForecast} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Forecast
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl sm:text-3xl">
            Welcome back, Fitness Warrior!
          </CardTitle>
          <CardDescription>
            Here's a snapshot of your fitness journey. Keep up the great work!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm sm:text-base">
            Ready to fine-tune your fitness plan? Complete our quick onboarding
            questionnaire to get personalized recommendations from our AI coach.
          </p>
          <Button asChild>
            <Link href="/onboarding">Personalize Your Plan</Link>
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Progress Overview</CardTitle>
            <CardDescription>
              Your weight and squat progression over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <AiDailyGoals />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Workout</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentWorkouts.map((workout, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-xs sm:text-sm">
                      {workout.date}
                    </TableCell>
                    <TableCell className="font-medium text-xs sm:text-sm">
                      {workout.type}
                    </TableCell>
                    <TableCell className="text-right text-xs sm:text-sm">
                      {workout.duration}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <AiForecast />
        </div>
      </div>
    </div>
  );
}
