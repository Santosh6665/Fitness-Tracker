
import { z } from "zod";

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  displayName: z.string().optional(),
  age: z.number().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  goals: z.array(z.string()).optional(),
});
  
export type UserProfile = z.infer<typeof userProfileSchema>;

const nutritionItemSchema = z.object({
  current: z.number(),
  target: z.number(),
});

export const dailyNutritionLogSchema = z.object({
  calories: nutritionItemSchema,
  protein: nutritionItemSchema,
  carbs: nutritionItemSchema,
  fats: nutritionItemSchema,
  water: nutritionItemSchema,
});

export type DailyNutritionLog = z.infer<typeof dailyNutritionLogSchema>;

export const dailyWorkoutLogSchema = z.object({
    sessions: z.number(),
    duration: z.number(),
    calories: z.number(),
});

export type DailyWorkoutLog = z.infer<typeof dailyWorkoutLogSchema>;


export const workoutEntrySchema = z.object({
    date: z.string(),
    sessions: z.number(),
    duration: z.number(),
    calories: z.number(),
});

export type WorkoutEntry = z.infer<typeof workoutEntrySchema>;

    