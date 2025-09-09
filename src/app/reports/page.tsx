
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Calendar,
  CalendarDays,
  Flame,
  Loader2,
  Sparkles,
  Timer,
  Trophy,
  Salad,
  Beef,
  Wheat,
  Fish,
} from "lucide-react";
import { WeeklyActivityChart } from "@/components/reports/weekly-activity-chart";
import {
  generateWeeklyReport,
  GenerateWeeklyReportOutput,
} from "@/ai/flows/generate-weekly-report";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-provider";
import { DailyWorkoutLog, DailyNutritionLog, DailyGoal } from "@/lib/types";
import { getTodaysWorkoutLog, getWorkoutHistory } from "@/services/workoutService";
import { getTodaysNutrition } from "@/services/nutritionService";
import { getTodaysGoals } from "@/services/goalService";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

function DailyReport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workoutLog, setWorkoutLog] = useState<DailyWorkoutLog | null>(null);
  const [nutritionLog, setNutritionLog] = useState<DailyNutritionLog | null>(
    null
  );
  const [goals, setGoals] = useState<DailyGoal[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const [workoutData, nutritionData, goalsData] = await Promise.all([
          getTodaysWorkoutLog(user.uid),
          getTodaysNutrition(user.uid),
          getTodaysGoals(user.uid),
        ]);
        setWorkoutLog(workoutData);
        setNutritionLog(nutritionData);
        setGoals(goalsData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to load daily report",
          description: "Could not fetch today's data from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user, toast]);
  
  const nutritionMeta = {
    calories: { label: "Calories", unit: "kcal", icon: Flame },
    protein: { label: "Protein", unit: "g", icon: Beef },
    carbs: { label: "Carbohydrates", unit: "g", icon: Wheat },
    fats: { label: "Fats", unit: "g", icon: Fish },
  };

  if (isLoading) {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
             <Card>
                <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                <CardContent><Skeleton className="h-32 w-full" /></CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Activity /> Workout Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Workouts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline">
                {workoutLog?.sessions || 0}
              </div>
              <p className="text-xs text-muted-foreground">sessions today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Time</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline">
                {workoutLog?.duration || 0} min
              </div>
              <p className="text-xs text-muted-foreground">total duration</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Calories Burned
              </CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline">
                ~{workoutLog?.calories || 0} kcal
              </div>
              <p className="text-xs text-muted-foreground">
                from workouts
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Salad /> Nutrition Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(nutritionMeta).map(([key, meta]) => {
                const data = nutritionLog?.[key as keyof typeof nutritionMeta];
                return (
                     <Card key={key}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{meta.label}</CardTitle>
                            <meta.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-headline">
                            {data?.current || 0}
                            <span className="text-sm font-normal text-muted-foreground">
                                {" "}/ {data?.target || 0} {meta.unit}
                            </span>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Trophy /> Daily Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {goals && goals.length > 0 ? (
                goals.map((goal, index) => (
                    <div key={index}>
                        <div className="flex justify-between items-center text-sm font-medium mb-1">
                            <span>{goal.name}</span>
                            <span className="text-muted-foreground">
                                {goal.current} / {goal.target} {goal.unit}
                            </span>
                        </div>
                        <Progress
                            value={(goal.current / goal.target) * 100}
                            aria-label={`${goal.name} progress`}
                        />
                    </div>
                ))
            ) : (
                <p className="text-muted-foreground text-center">No goals set for today.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

function MonthlyReport() {
  return (
    <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
      <CalendarDays className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-xl font-semibold">Monthly Reports Coming Soon</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        A comprehensive monthly summary of your progress is on the way.
      </p>
    </div>
  );
}

function WeeklyReport() {
  const [report, setReport] = useState<GenerateWeeklyReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    async function fetchWeeklyData() {
        if (!user) {
            setIsLoadingData(false);
            return;
        }
        setIsLoadingData(true);
        try {
            const history = await getWorkoutHistory(user.uid);
            const today = new Date();
            const last7Days = Array.from({length: 7}).map((_, i) => {
                const d = new Date();
                d.setDate(today.getDate() - i);
                return {
                    day: d.toLocaleDateString('en-US', { weekday: 'short'}),
                    workouts: 0,
                    duration: 0,
                }
            }).reverse();

            history.forEach(workout => {
                const workoutDate = new Date(workout.date);
                const dayStr = workoutDate.toLocaleDateString('en-US', { weekday: 'short'});
                const dayIndex = last7Days.findIndex(d => d.day === dayStr);

                if (dayIndex > -1) {
                    last7Days[dayIndex].workouts += workout.sessions;
                    last7Days[dayIndex].duration += workout.duration;
                }
            });
            setWeeklyActivity(last7Days);

        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to load weekly data' });
        } finally {
            setIsLoadingData(false);
        }
    }
    fetchWeeklyData();
  }, [user, toast]);


  const totalWorkouts = weeklyActivity.reduce(
    (sum, day) => sum + day.workouts,
    0
  );
  const totalDuration = weeklyActivity.reduce(
    (sum, day) => sum + day.duration,
    0
  );
  const totalCalories = totalDuration * 8; // Approximation

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setReport(null);
    try {
      const result = await generateWeeklyReport({
        weeklyActivity: weeklyActivity,
      });
      setReport(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Report Generation Failed",
        description:
          "There was an error generating the AI report. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
      return <div className="flex items-center justify-center p-16"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Workouts
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              {totalWorkouts} sessions
            </div>
            <p className="text-xs text-muted-foreground">in the last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Duration
            </CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              {totalDuration} min
            </div>
            <p className="text-xs text-muted-foreground">
             in the last 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Calories Burned
            </CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              ~{totalCalories} kcal
            </div>
            <p className="text-xs text-muted-foreground">
              Based on total duration
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Weekly Activity</CardTitle>
            <CardDescription>
              Your workout sessions over the last week.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <WeeklyActivityChart data={weeklyActivity} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">
              AI-Powered Insights
            </CardTitle>
            <CardDescription>
              Your weekly summary and recommendations from our AI coach.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating insights...
              </div>
            ) : report ? (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle className="font-headline">{report.title}</AlertTitle>
                <AlertDescription>
                  <p className="whitespace-pre-line">{report.summary}</p>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground">
                <p className="mb-4">
                  Click the button to get personalized insights on your weekly
                  performance.
                </p>
                <Button onClick={handleGenerateReport} disabled={isLoading}>
                  <Sparkles className="mr-2" />
                  Generate AI Insights
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Tabs defaultValue="weekly" className="space-y-4">
      <TabsList>
        <TabsTrigger value="daily">Daily</TabsTrigger>
        <TabsTrigger value="weekly">Weekly</TabsTrigger>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
      </TabsList>
      <TabsContent value="daily">
        <DailyReport />
      </TabsContent>
      <TabsContent value="weekly">
        <WeeklyReport />
      </TabsContent>
      <TabsContent value="monthly">
        <MonthlyReport />
      </TabsContent>
    </Tabs>
  );
}
