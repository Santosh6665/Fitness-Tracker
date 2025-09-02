
'use server';
/**
 * @fileOverview A Genkit flow for generating dynamic daily fitness goals.
 *
 * - generateDailyGoals - A function that generates a set of daily goals.
 * - DailyGoalsOutput - The return type for the generateDailyGoals function.
 * - DailyGoal - The type for a single daily goal.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DailyGoalSchema = z.object({
    name: z.string().describe("The name of the goal (e.g., 'Walk 10,000 steps')."),
    current: z.number().describe("The user's current progress towards the goal."),
    target: z.number().describe('The target value for the goal.'),
    unit: z.string().describe("The unit for the goal (e.g., 'steps', 'minutes', 'meters')."),
});

export type DailyGoal = z.infer<typeof DailyGoalSchema>;

const DailyGoalsOutputSchema = z.object({
  goals: z.array(DailyGoalSchema).describe('A list of 2-4 daily fitness goals for the user.'),
});

export type DailyGoalsOutput = z.infer<typeof DailyGoalsOutputSchema>;


export async function generateDailyGoals(): Promise<DailyGoalsOutput> {
  return generateDailyGoalsFlow();
}

const prompt = ai.definePrompt({
  name: 'generateDailyGoalsPrompt',
  output: { schema: DailyGoalsOutputSchema },
  prompt: `You are a motivating and creative AI fitness coach.
Generate a set of 2 to 4 varied and engaging daily fitness goals for a user.
The goals should be a mix of activity, mindfulness, and nutrition.
For each goal, provide a name, a target, and a unit.
The 'current' progress for all generated goals should be a random number between 0 and the target, to simulate a user's progress through the day.
Make the goals interesting and achievable.

Example goals:
- Walk 10,000 steps
- Meditate for 5 minutes
- Drink 8 glasses of water
- Do 20 minutes of stretching

Generate a new, unique set of goals now.
`,
});

const generateDailyGoalsFlow = ai.defineFlow(
  {
    name: 'generateDailyGoalsFlow',
    outputSchema: DailyGoalsOutputSchema,
  },
  async () => {
    const { output } = await prompt();
    console.log("Output", output)
    return output!;
  }
);
