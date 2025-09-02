
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GetPostWorkoutNutritionAdviceInputSchema = z.object({
  workoutType: z.string().describe('The type of workout the user just completed (e.g., "Full Body Strength", "Cardio & Core").'),
});

export type GetPostWorkoutNutritionAdviceInput = z.infer<typeof GetPostWorkoutNutritionAdviceInputSchema>;

const GetPostWorkoutNutritionAdviceOutputSchema = z.object({
  advice: z.string().describe('A concise, actionable nutrition tip tailored to the workout type.'),
});

export type GetPostWorkoutNutritionAdviceOutput = z.infer<typeof GetPostWorkoutNutritionAdviceOutputSchema>;

export async function getPostWorkoutNutritionAdvice(input: GetPostWorkoutNutritionAdviceInput): Promise<GetPostWorkoutNutritionAdviceOutput> {
  return getPostWorkoutNutritionAdviceFlow(input);
}

const prompt = ai.definePrompt({
    name: 'getPostWorkoutNutritionAdvicePrompt',
    input: { schema: GetPostWorkoutNutritionAdviceInputSchema },
    output: { schema: GetPostWorkoutNutritionAdviceOutputSchema },
    prompt: `You are an expert sports nutritionist.
A user just finished a workout and wants a nutrition tip.
Their last workout was: {{{workoutType}}}.

Based on this workout type, provide a single, actionable nutrition tip.
For strength or power workouts, focus on protein for muscle repair.
For cardio or endurance workouts, focus on carbohydrates to replenish glycogen stores.
Keep the tip concise and easy to understand.

Example for 'Leg Day': "Great job on the tough leg session! To help your muscles recover and grow, have a snack with at least 20g of protein within the next hour. A protein shake or Greek yogurt would be perfect."
Example for 'Long Run': "Excellent run! Make sure to replenish your energy stores with some easily digestible carbohydrates. A banana or a small bowl of oatmeal are great choices."
`,
});


const getPostWorkoutNutritionAdviceFlow = ai.defineFlow(
  {
    name: 'getPostWorkoutNutritionAdviceFlow',
    inputSchema: GetPostWorkoutNutritionAdviceInputSchema,
    outputSchema: GetPostWorkoutNutritionAdviceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
