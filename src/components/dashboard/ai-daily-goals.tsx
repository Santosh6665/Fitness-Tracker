
"use client";

import { generateDailyGoals, type DailyGoal } from "@/ai/flows/generate-daily-goals";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Loader2, Sparkles, Minus, Plus } from "lucide-react";
import { Progress } from "../ui/progress";
import { useAuth } from "@/components/auth/auth-provider";
import { getTodaysGoals, updateTodaysGoals } from "@/services/goalService";

export function AiDailyGoals() {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGoals = useCallback(async (forceNew = false) => {
    if (!user) return;
    setIsLoading(true);
    try {
      let result = await getTodaysGoals(user.uid);
      if (!result || forceNew) {
        const aiResult = await generateDailyGoals();
        await updateTodaysGoals(user.uid, aiResult.goals);
        result = aiResult.goals;
      }
      setGoals(result || []);
    } catch (error) {
      console.error("Failed to fetch daily goals:", error);
      toast({
        variant: "destructive",
        title: "Failed to load goals",
        description: "Could not fetch AI-powered daily goals. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleUpdateGoal = async (goalIndex: number, newCurrent: number) => {
    if (!user) return;
    
    const updatedGoals = [...goals];
    const goal = updatedGoals[goalIndex];
    const clampedCurrent = Math.max(0, Math.min(goal.target, newCurrent));
    
    updatedGoals[goalIndex] = { ...goal, current: clampedCurrent };
    setGoals(updatedGoals);

    try {
      await updateTodaysGoals(user.uid, updatedGoals);
    } catch (error) {
      console.error("Failed to update goal:", error);
      toast({ variant: 'destructive', title: 'Update failed', description: 'Could not save goal progress.' });
      // Revert state on error
      setGoals(goals);
    }
  };

  const getIncrementStep = (unit: string) => {
    if (unit === 'steps') return 1000;
    if (unit === 'minutes') return 5;
    if (unit === 'glasses' || unit === 'L') return 1;
    return 1;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">AI Daily Goals</CardTitle>
        <CardDescription>
          Your AI-generated goals for today. Crush them!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 min-h-[148px]">
        {isLoading ? (
          <div className="flex items-center justify-center text-muted-foreground h-24">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading goals...
          </div>
        ) : goals.length > 0 ? (
          goals.map((goal, index) => (
            <div key={index}>
              <div className="flex justify-between items-center text-sm font-medium mb-1">
                <span>{goal.name}</span>
                <span className="text-muted-foreground">
                  {goal.current} / {goal.target} {goal.unit}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Progress
                  value={(goal.current / goal.target) * 100}
                  aria-label={`${goal.name} progress`}
                  className="h-2"
                />
                <Button size="icon" variant="outline" className="h-6 w-6 shrink-0 rounded-full" onClick={() => handleUpdateGoal(index, goal.current - getIncrementStep(goal.unit))}>
                    <Minus className="h-3 w-3"/>
                </Button>
                <Button size="icon" variant="outline" className="h-6 w-6 shrink-0 rounded-full" onClick={() => handleUpdateGoal(index, goal.current + getIncrementStep(goal.unit))}>
                    <Plus className="h-3 w-3"/>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground h-24 flex items-center justify-center">
            <p>Click the button below to generate your daily goals!</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => fetchGoals(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate New Goals
        </Button>      
      </CardFooter>
    </Card>
  );
}

    