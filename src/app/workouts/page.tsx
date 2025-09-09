
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Edit, Flame, Loader2, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-provider";
import { getTodaysWorkoutLog, updateTodaysWorkoutLog } from "@/services/workoutService";
import { DailyWorkoutLog } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


const initialWorkoutData: DailyWorkoutLog = {
  sessions: 0,
  duration: 0,
  calories: 0,
};

const workoutMeta = {
    sessions: { label: "Workouts", unit: "sessions", icon: Activity },
    duration: { label: "Total Duration", unit: "min", icon: Timer },
    calories: { label: "Calories Burned", unit: "kcal", icon: Flame },
};

type ManualLogData = {
    type: string;
    duration: number;
    calories: number;
};


export default function WorkoutsPage() {
  const [workoutLog, setWorkoutLog] = useState<DailyWorkoutLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchWorkoutData() {
      if (user) {
        setIsLoading(true);
        try {
          const data = await getTodaysWorkoutLog(user.uid);
          setWorkoutLog(data || initialWorkoutData);
        } catch (error) {
          toast({ variant: 'destructive', title: 'Failed to load workout data.' });
          setWorkoutLog(initialWorkoutData);
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchWorkoutData();
  }, [user, toast]);

  const handleLogWorkout = async (workoutData: ManualLogData) => {
    if (!user || !workoutLog) return;

    const newWorkoutLog: DailyWorkoutLog = {
      ...workoutLog,
      sessions: workoutLog.sessions + 1,
      duration: workoutLog.duration + workoutData.duration,
      calories: workoutLog.calories + workoutData.calories,
    };

    setWorkoutLog(newWorkoutLog);

    try {
      await updateTodaysWorkoutLog(user.uid, newWorkoutLog);
      toast({
        title: "Workout Logged!",
        description: `Your ${workoutData.type} workout has been added to your daily log.`
      });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to save log.', description: 'Your entry was logged locally but could not be saved to the database.' });
      setWorkoutLog(workoutLog); // Revert state on error
    }
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline">Today's Activity</CardTitle>
            <CardDescription>Your workout summary for today.</CardDescription>
          </div>
          <LogWorkoutDialog onLogWorkout={handleLogWorkout} />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)
          ) : (
            Object.entries(workoutLog || initialWorkoutData).map(([key, value]) => {
              const meta = workoutMeta[key as keyof typeof workoutMeta];
              if (!meta) return null;
              return (
                <Card key={key}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {meta.label}
                    </CardTitle>
                    <meta.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-headline">
                      {value}
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}{meta.unit}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const manualLogSchema = z.object({
  type: z.string().min(3, "Please enter a valid workout type."),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute."),
  calories: z.coerce.number().min(0, "Cannot be negative."),
});

type ManualLogValues = z.infer<typeof manualLogSchema>;

function LogWorkoutDialog({ onLogWorkout }: { onLogWorkout: (data: ManualLogValues) => void }) {
  const [open, setOpen] = useState(false);
  const form = useForm<ManualLogValues>({
    resolver: zodResolver(manualLogSchema),
    defaultValues: {
      type: "",
      duration: 0,
      calories: 0,
    },
  });

  const onSubmit = (values: ManualLogValues) => {
    onLogWorkout(values);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Edit className="mr-2" /> Log a Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Log a Workout</DialogTitle>
          <DialogDescription>
            Enter the details of your completed workout session.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workout Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Full Body Strength" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories Burned (kcal)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                Add to Daily Log
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}