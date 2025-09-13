
"use client";

import { useState, useEffect } from "react";
import { Bot, Loader2, Sparkles, RefreshCw, LineChart as LineChartIcon, Activity, Timer, Flame, Salad, Trophy } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AiDailyGoals } from "@/components/dashboard/ai-daily-goals";
import { useAuth } from "@/components/auth/auth-provider";
import { getUserProfile } from "@/services/userService";
import { UserProfile, DailyWorkoutLog, ActivityEntry } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { getTodaysWorkoutLog, getWorkoutHistory } from "@/services/workoutService";
import { getNutritionHistory } from "@/services/nutritionService";
import { getGoalsHistory } from "@/services/goalService";
import { predictFutureProgress } from "@/ai/flows/predict-future-progress";
import { progressData } from "@/lib/data";
import { Footer } from "@/components/layout/footer";
import { ProgressChart } from "@/components/dashboard/progress-chart";


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
    const [activity, setActivity] = useState<ActivityEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const fetchActivity = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const workoutHistory = await getWorkoutHistory(user.uid);
            const nutritionHistory = await getNutritionHistory(user.uid);
            const goalsHistory = await getGoalsHistory(user.uid);

            const workoutActivities: ActivityEntry[] = workoutHistory.map(w => ({
                date: w.date,
                type: 'workout',
                description: `${w.sessions} session${w.sessions > 1 ? 's' : ''}`,
                value: `${w.duration} min`,
            }));
            
            const mealActivities: ActivityEntry[] = nutritionHistory.map(n => ({
                date: (n as any).date,
                type: 'meal',
                description: `Logged meals`,
                value: `${n.calories.current} kcal`,
            }));

            const goalActivities: ActivityEntry[] = goalsHistory.map(g => {
                const completedGoals = g.goals.filter(goal => goal.current >= goal.target).length;
                const totalGoals = g.goals.length;
                const allCompleted = completedGoals === totalGoals;

                return {
                    date: g.date,
                    type: 'goals',
                    description: allCompleted ? 'All Daily Goals Achieved' : `${completedGoals} / ${totalGoals} Goals Achieved`,
                    value: `+${completedGoals} Goals`,
                }
            });


            const combined = [...workoutActivities, ...mealActivities, ...goalActivities];
            combined.sort((a, b) => b.date.localeCompare(a.date));

            setActivity(combined.slice(0, 10));

        } catch (error) {
            console.error("Failed to fetch recent activity:", error);
            toast({
                variant: "destructive",
                title: "Failed to load activity",
                description: "Could not fetch your recent activity. Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
      if (user) {
        fetchActivity();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const iconMap = {
      workout: <Activity className="h-4 w-4 text-primary" />,
      meal: <Salad className="h-4 w-4 text-green-500" />,
      goals: <Trophy className="h-4 w-4 text-yellow-500" />,
    }

    return (
        <Card className="h-full">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle className="font-headline">Recent Activity</CardTitle>
                <CardDescription>Your latest workout and nutrition logs.</CardDescription>
            </div>
             <Button variant="outline" size="sm" onClick={() => fetchActivity()} disabled={isLoading} className="mt-2 sm:mt-0">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="hidden md:table-cell">Details</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                      Array.from({length: 5}).map((_, i) => (
                          <TableRow key={i}>
                              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                              <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                              <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                          </TableRow>
                      ))
                  ) : activity.length > 0 ? (
                      activity.map((item, index) => (
                      <TableRow key={index}>
                          <TableCell className="text-xs sm:text-sm">
                              {item.date}
                          </TableCell>
                          <TableCell className="font-medium text-xs sm:text-sm flex items-center gap-2">
                            {iconMap[item.type]}
                            <span className="capitalize">{item.type}</span>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                              {item.description}
                          </TableCell>
                          <TableCell className="text-right text-xs sm:text-sm">
                              {item.value}
                          </TableCell>
                      </TableRow>
                      ))
                  ) : (
                      <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                              No activity found.
                          </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
    )
}

function TodaysWorkout() {
  const [workoutLog, setWorkoutLog] = useState<DailyWorkoutLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchWorkoutLog() {
      if (user) {
        setIsLoading(true);
        try {
          const data = await getTodaysWorkoutLog(user.uid);
          setWorkoutLog(data);
        } catch (error) {
          toast({ variant: 'destructive', title: 'Failed to load workout data.' });
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchWorkoutLog();
  }, [user, toast]);

  const stats = [
    { name: 'Workouts', value: workoutLog?.sessions || 0, unit: 'sessions', icon: Activity },
    { name: 'Duration', value: workoutLog?.duration || 0, unit: 'min', icon: Timer },
    { name: 'Calories', value: `~${workoutLog?.calories || 0}`, unit: 'kcal', icon: Flame },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Today's Workout</CardTitle>
        <CardDescription>A summary of your activity today.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)
        ) : (
          stats.map(stat => (
            <div key={stat.name} className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-3">
                <stat.icon className="h-6 w-6 text-primary" />
                <span className="font-medium">{stat.name}</span>
              </div>
              <span className="font-bold font-headline">{stat.value} <span className="text-sm font-normal text-muted-foreground">{stat.unit}</span></span>
            </div>
          ))
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
            <Link href="/workouts">Log a Workout</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function ProgressOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <LineChartIcon />
            Progress Overview
        </CardTitle>
        <CardDescription>
          A visual summary of your key progress metrics over time.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-0 pr-4">
        <ProgressChart />
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressOverview />
            <AiDailyGoals />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <RecentActivity />
            </div>
            <div className="space-y-6">
                <TodaysWorkout />
                <AIForecast />
            </div>
        </div>

      </div>
    );
}

    