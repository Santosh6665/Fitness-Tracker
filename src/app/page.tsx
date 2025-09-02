
"use client";

import { useState, useEffect } from "react";
import { Bot, Loader2, Sparkles, RefreshCw, LineChart } from "lucide-react";
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
import { progressData } from "@/lib/data";
import { WeightProgressChart } from "@/components/dashboard/weight-progress-chart";
import { StrengthProgressChart } from "@/components/dashboard/strength-progress-chart";
import { predictFutureProgress } from "@/ai/flows/predict-future-progress";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AiDailyGoals } from "@/components/dashboard/ai-daily-goals";
import { generateRecentWorkouts, type RecentWorkout } from "@/ai/flows/generate-recent-workouts";
import { recentWorkouts as staticRecentWorkouts } from "@/lib/data";
import { useAuth } from "@/components/auth/auth-provider";
import { getUserProfile } from "@/services/userService";
import { UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";


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
            <p>Click the button to generate a forecast.</p>
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

function RecentActivity() {
    const [workouts, setWorkouts] = useState<RecentWorkout[]>(staticRecentWorkouts);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const fetchWorkouts = async () => {
        setIsLoading(true);
        try {
            const result = await generateRecentWorkouts();
            setWorkouts(result.workouts);
        } catch (error) {
            console.error("Failed to fetch recent workouts:", error);
            toast({
                variant: "destructive",
                title: "Failed to load activity",
                description: "Could not fetch your recent workouts. This may be due to API rate limits. Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
      fetchWorkouts();
    }, [])

    return (
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle className="font-headline">Recent Activity</CardTitle>
                <CardDescription>Your latest workout log.</CardDescription>
            </div>
             <Button variant="outline" size="sm" onClick={fetchWorkouts} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Refresh
            </Button>
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
                {workouts.map((workout, index) => (
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
    )
}

function ProgressOverview() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            if (user) {
                try {
                    const userProfile = await getUserProfile(user.uid);
                    setProfile(userProfile);
                } catch (error) {
                    console.error("Failed to fetch user profile", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        }
        fetchProfile();
    }, [user]);

    const hasWeightLossGoal = profile?.goals?.includes('weight_loss');
    const hasMuscleGainGoal = profile?.goals?.includes('muscle_gain');

    const renderChart = () => {
        if (isLoading) {
            return <Skeleton className="h-[300px]" />;
        }

        if (!profile || !profile.goals || profile.goals.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground p-4">
                    <LineChart className="h-12 w-12 mb-4" />
                    <h3 className="font-semibold text-lg">Personalize Your Dashboard</h3>
                    <p className="mb-4">Complete your profile to see a personalized progress chart based on your goals.</p>
                    <Button asChild>
                        <Link href="/onboarding">Personalize Your Plan</Link>
                    </Button>
                </div>
            );
        }

        if (hasWeightLossGoal) {
            return <WeightProgressChart userWeight={profile.weight} />;
        }

        if (hasMuscleGainGoal) {
            return <StrengthProgressChart />;
        }
        
        return <StrengthProgressChart />;
    };
    
    const getCardDescription = () => {
        if (!profile || isLoading) return "Your progress based on your goals.";
        if (hasWeightLossGoal) return "Your weight progression over the last 6 months.";
        if (hasMuscleGainGoal) return "Your squat strength progression over the last 6 months.";
        return "Your general progress over the last 6 months.";
    }

    return (
         <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Progress Overview</CardTitle>
            <CardDescription>
              {getCardDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderChart()}
          </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="flex flex-col gap-6">
        <Card>
            <CardHeader>
            <CardTitle className="font-headline text-2xl sm:text-3xl">
                Welcome back, {user?.displayName || 'Fitness Warrior'}!
            </CardTitle>
            <CardDescription>
                Here's a snapshot of your fitness journey. Keep up the great work!
            </CardDescription>
            </CardHeader>
        </Card>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ProgressOverview />
            <div className="space-y-6">
            <AiDailyGoals />
            </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <RecentActivity />
            <div className="space-y-6">
            <AiForecast />
            </div>
        </div>
        </div>
    );
}
