
"use client";

import { useState, useEffect } from "react";
import { Share2, Sparkles, Loader2, Bot } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { recentWorkouts, progressData } from "@/lib/data";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { generateDailyGoals, type DailyGoal } from "@/ai/flows/generate-daily-goals";
import { predictFutureProgress } from "@/ai/flows/predict-future-progress";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


function AiDailyGoals() {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const result = await generateDailyGoals();
      setGoals(result.goals);
    } catch (error) {
      console.error("Failed to fetch daily goals:", error);
      toast({
        variant: "destructive",
        title: "Failed to generate goals",
        description: "Could not fetch AI-powered daily goals. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI Daily Goals</CardTitle>
          <CardDescription>Your AI-generated goals for today. Crush them!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
             <div className="flex items-center justify-center text-muted-foreground h-24">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating goals...
            </div>
          ) : (
            goals.map((goal, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>{goal.name}</span>
                  <span className="text-muted-foreground">{goal.current}{goal.unit} / {goal.target}{goal.unit}</span>
                </div>
                <Progress value={(goal.current / goal.target) * 100} aria-label={`${goal.name} progress`} />
              </div>
            ))
          )}
           { !isLoading && goals.length === 0 && (
                <div className="text-center text-muted-foreground h-24 flex items-center justify-center">
                    <p>No goals generated yet. Click the button to get started!</p>
                </div>
            )}
        </CardContent>
        <CardFooter>
           <Button variant="outline" className="w-full" onClick={fetchGoals} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
              Generate New Goals
           </Button>
        </CardFooter>
      </Card>
  )
}

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
        <CardDescription>Predict your future fitness progress.</CardDescription>
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
           {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
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
          <CardTitle className="font-headline text-3xl">Welcome back, Fitness Warrior!</CardTitle>
          <CardDescription>
            Here's a snapshot of your fitness journey. Keep up the great work!
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="mb-4">Ready to fine-tune your fitness plan? Complete our quick onboarding questionnaire to get personalized recommendations from our AI coach.</p>
             <Button asChild>
                <Link href="/onboarding">Personalize Your Plan</Link>
            </Button>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Progress Overview</CardTitle>
            <CardDescription>Your weight and squat progression over the last 6 months.</CardDescription>
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
                      <TableCell>{workout.date}</TableCell>
                      <TableCell className="font-medium">{workout.type}</TableCell>
                      <TableCell className="text-right">{workout.duration}</TableCell>
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
