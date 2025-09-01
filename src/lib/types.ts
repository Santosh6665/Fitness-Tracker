import { type exercises } from "./data";
import { z } from "zod";

export type Exercise = (typeof exercises)[0];

export const userProfileSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    displayName: z.string().optional(),
    age: z.number().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    goals: z.array(z.string()).optional(),
});
  
export type UserProfile = z.infer<typeof userProfileSchema>;
