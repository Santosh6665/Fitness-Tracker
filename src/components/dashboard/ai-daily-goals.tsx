
"use client";

import { generateDailyGoals, type DailyGoal } from "@/ai/flows/generate-daily-goals";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { Progress } from "../ui/progress";

export function AiDailyGoals() {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchGoals = async () => {
    setIsLoading(true);
    setGoals([]);
    try {
      const result = await generateDailyGoals();
      setGoals(result.goals);
    } catch (error) {
      console.error("Failed to fetch daily goals:", error);
      toast({
        variant: "destructive",
        title: "Failed to generate goals",
        description:
          "Could not fetch AI-powered daily goals. This may be due to API rate limits. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            Generating goals...
          </div>
        ) : goals.length > 0 ? (
          goals.map((goal, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span>{goal.name}</span>
                <span className="text-muted-foreground">
                  {goal.current}
                  {goal.unit} / {goal.target}
                  {goal.unit}
                </span>
              </div>
              <Progress
                value={(goal.current / goal.target) * 100}
                aria-label={`${goal.name} progress`}
              />
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
          onClick={fetchGoals}
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
