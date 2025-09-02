
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generatePersonalizedWorkoutPlan } from "@/ai/flows/generate-personalized-workout-plan";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Bot } from "lucide-react";
import { Markdown } from "@/components/markdown";

const formSchema = z.object({
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

export default function WorkoutPlanPage() {
  const [workoutPlan, setWorkoutPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fitnessGoals: "",
      availableEquipment: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="font-headline">Create Your Plan</CardTitle>
          <CardDescription>
            Tell us about yourself and we'll generate a personalized workout plan.
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
                    <FormDescription>
                      Be specific, or type 'none' if you have no equipment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Generating..." : "Generate Plan"}
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="md:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-headline">Your Personalized Plan</CardTitle>
            <CardDescription>
              Your AI-generated workout plan will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                 <p className="mt-4">Our AI is crafting your perfect plan...</p>
              </div>
            )}
            {workoutPlan && <Markdown content={workoutPlan} />}
            {!isLoading && !workoutPlan && (
               <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                 <Bot className="h-12 w-12" />
                 <p className="mt-4">Fill out the form to get started!</p>
               </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
