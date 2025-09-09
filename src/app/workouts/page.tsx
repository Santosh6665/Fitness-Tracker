
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
import { Activity, Edit, Flame, Loader2, RefreshCw, Timer, Sparkles, Bot, NotebookPen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-provider";
import { getTodaysWorkoutLog, updateTodaysWorkoutLog, getWorkoutHistory } from "@/services/workoutService";
import { DailyWorkoutLog, WorkoutEntry } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm, useWatch } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exercises } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { generatePersonalizedWorkoutPlan } from "@/ai/flows/generate-personalized-workout-plan";
import { Markdown } from "@/components/markdown";


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


function RecentActivity() {
    const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const fetchWorkouts = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const result = await getWorkoutHistory(user.uid);
            setWorkouts(result);
        } catch (error) {
            console.error("Failed to fetch recent workouts:", error);
            toast({
                variant: "destructive",
                title: "Failed to load activity",
                description: "Could not fetch your recent workouts. Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
      if (user) {
        fetchWorkouts();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    return (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle className="font-headline">Recent Activity</CardTitle>
                <CardDescription>Your latest workout log from the database.</CardDescription>
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
                  <TableHead>Workouts</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {isLoading ? (
                    Array.from({length: 3}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : workouts.length > 0 ? (
                    workouts.map((workout, index) => (
                    <TableRow key={index}>
                        <TableCell className="text-xs sm:text-sm">
                        {workout.date}
                        </TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm">
                        {workout.sessions} {workout.sessions > 1 ? 'sessions' : 'session'}
                        </TableCell>
                        <TableCell className="text-right text-xs sm:text-sm">
                        {workout.duration} min
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No workout history found.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    )
}

function TodaysActivity({ onLogWorkout }: { onLogWorkout: (data: ManualLogData) => void }) {
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

  useEffect(() => {
    if (workoutLog) {
      // This effect can be used if we need to react to workoutLog changes from manual logging
    }
  }, [workoutLog]);

  return (
     <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline">Today's Activity</CardTitle>
            <CardDescription>Your workout summary for today.</CardDescription>
          </div>
          <LogWorkoutDialog onLogWorkout={onLogWorkout} />
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
  )
}

const workoutPlanFormSchema = z.object({
  fitnessGoals: z.string().min(10, {
    message: "Please describe your fitness goals in at least 10 characters.",
  }),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select your experience level.",
  }),
  availableEquipment: z.string().min(2, {
    message: "Please list your equipment, or type 'none'.",
  }),
});


function WorkoutPlanGenerator() {
  const [workoutPlan, setWorkoutPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof workoutPlanFormSchema>>({
    resolver: zodResolver(workoutPlanFormSchema),
    defaultValues: {
      fitnessGoals: "",
      availableEquipment: "",
    },
  });

  async function onSubmit(values: z.infer<typeof workoutPlanFormSchema>) {
    setIsLoading(true);
    setWorkoutPlan(null);
    try {
      const result = await generatePersonalizedWorkoutPlan(values);
      setWorkoutPlan(result.workoutPlan);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to generate plan",
        description:
          "There was an error generating your workout plan. Please try again.",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <NotebookPen /> AI Workout Plan Generator
        </CardTitle>
        <CardDescription>
          Tell us about yourself and we'll generate a personalized workout plan. Your generated plan will appear below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fitnessGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fitness Goals</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., lose 10 pounds, build muscle, improve cardio"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availableEquipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Equipment</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Dumbbells, resistance bands, or 'none'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <><Loader2 className="animate-spin mr-2"/> Generating...</> : <>Generate Plan<Sparkles className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>
        </Form>

         <div className="mt-6">
          {isLoading && (
            <div className="flex flex-col h-full items-center justify-center text-center text-muted-foreground p-8 min-h-[200px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4">Our AI is crafting your perfect plan...</p>
            </div>
          )}
          {workoutPlan && <Markdown content={workoutPlan} />}
          {!isLoading && !workoutPlan && (
              <div className="flex flex-col h-full items-center justify-center text-center text-muted-foreground p-8 min-h-[200px] border-2 border-dashed rounded-lg">
                <Bot className="h-12 w-12" />
                <p className="mt-4">Your AI-generated plan will appear here.</p>
              </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


export default function WorkoutsPage() {
  const [key, setKey] = useState(0); // Used to force re-render child components
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLogWorkout = async (workoutData: ManualLogData) => {
    if (!user) return;
    
    try {
      const currentLog = await getTodaysWorkoutLog(user.uid) || initialWorkoutData;
      
      const newWorkoutLog: DailyWorkoutLog = {
        ...currentLog,
        sessions: currentLog.sessions + 1,
        duration: currentLog.duration + workoutData.duration,
        calories: currentLog.calories + workoutData.calories,
      };
      
      await updateTodaysWorkoutLog(user.uid, newWorkoutLog);
      toast({
        title: "Workout Logged!",
        description: `Your ${workoutData.type} workout has been added to your daily log.`
      });
      // Force re-render of children to show updated data
      setKey(prevKey => prevKey + 1);

    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to save log.', description: 'Your entry was logged locally but could not be saved to the database.' });
    }
  };


  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <TodaysActivity key={`today-${key}`} onLogWorkout={handleLogWorkout} />
        <RecentActivity key={`recent-${key}`} />
      </div>
      <div className="space-y-6">
        <WorkoutPlanGenerator />
      </div>
    </div>
  );
}

const manualLogSchema = z.object({
  type: z.string().min(1, "Please select a workout type."),
  otherType: z.string().optional(),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute."),
  calories: z.coerce.number().min(0, "Cannot be negative."),
}).refine(data => {
    if (data.type === 'Other' && (!data.otherType || data.otherType.length < 3)) {
        return false;
    }
    return true;
}, {
    message: "Please enter a valid custom workout type (min. 3 characters).",
    path: ["otherType"],
});


type ManualLogValues = z.infer<typeof manualLogSchema>;

const workoutTypes = [
    ...new Set(exercises.map(e => e.muscleGroup).concat(["Cardio", "HIIT", "Yoga", "Pilates", "Stretching"])),
    "Other"
];

const caloriesPerMinuteMap: Record<string, number> = {
    "Chest": 6,
    "Legs": 7,
    "Back": 6,
    "Shoulders": 5,
    "Arms": 4,
    "Core": 4,
    "Cardio": 10,
    "HIIT": 14,
    "Yoga": 3,
    "Pilates": 3,
    "Stretching": 2,
    "Other": 7
};


function LogWorkoutDialog({ onLogWorkout }: { onLogWorkout: (data: { type: string; duration: number; calories: number; }) => void }) {
  const [open, setOpen] = useState(false);
  const form = useForm<ManualLogValues>({
    resolver: zodResolver(manualLogSchema),
    defaultValues: {
      type: "",
      otherType: "",
      duration: 0,
      calories: 0,
    },
  });

  const { control, setValue, watch } = form;
  const watchedType = watch("type");
  const watchedDuration = watch("duration");

  useEffect(() => {
    if (watchedType && watchedDuration > 0) {
      const calories = Math.round((caloriesPerMinuteMap[watchedType] || 7) * watchedDuration);
      setValue("calories", calories);
    }
  }, [watchedType, watchedDuration, setValue]);


  const onSubmit = (values: ManualLogValues) => {
    const workoutData = {
        type: values.type === 'Other' ? values.otherType! : values.type,
        duration: values.duration,
        calories: values.calories,
    };
    onLogWorkout(workoutData);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) form.reset();
    }}>
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
                control={control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a workout type" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {workoutTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedType === "Other" && (
                <FormField
                  control={control}
                  name="otherType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Workout Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Rock Climbing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
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
                control={control}
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

    
