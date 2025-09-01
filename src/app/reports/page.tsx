
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
  BarChart,
  Flame,
  Activity,
  Timer,
  Sparkles,
  Loader2,
  Calendar,
  CalendarDays,
} from "lucide-react";
import { WeeklyActivityChart } from "@/components/reports/weekly-activity-chart";
import { weeklyActivity } from "@/lib/data";
import type { WeeklyActivity } from "@/lib/data";
import {
  generateWeeklyReport,
  GenerateWeeklyReportOutput,
} from "@/ai/flows/generate-weekly-report";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function DailyReport() {
  return (
    <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
      <Calendar className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-xl font-semibold">Daily Reports Coming Soon</h3>
      <p className="mt-2 text-sm text-muted-foreground">Check back later for a detailed view of your daily activity.</p>
    </div>
  );
}

function MonthlyReport() {
  return (
    <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
      <CalendarDays className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-xl font-semibold">Monthly Reports Coming Soon</h3>
      <p className="mt-2 text-sm text-muted-foreground">A comprehensive monthly summary of your progress is on the way.</p>
    </div>
  );
}

function WeeklyReport() {
  const [report, setReport] = useState<GenerateWeeklyReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const totalWorkouts = weeklyActivity.reduce(
    (sum, day) => sum + day.workouts,
    0
  );
  const totalDuration = weeklyActivity.reduce(
    (sum, day) => sum + day.duration,
    0
  );
  const totalCalories = totalDuration * 8; // Simple estimation

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

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              {totalWorkouts} sessions
            </div>
            <p className="text-xs text-muted-foreground">+2 since last week</p>
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
            <p className="text-xs text-muted-foreground">+30 min since last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
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
            <CardTitle className="font-headline">AI-Powered Insights</CardTitle>
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
                <AlertTitle className="font-headline">
                  {report.title}
                </AlertTitle>
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
        <TabsTrigger value="daily">
          Daily
        </TabsTrigger>
        <TabsTrigger value="weekly">Weekly</TabsTrigger>
        <TabsTrigger value="monthly">
          Monthly
        </TabsTrigger>
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
