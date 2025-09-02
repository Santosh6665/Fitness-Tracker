
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RecentWorkoutSchema = z.object({
    date: z.string().describe("The date of the workout in 'YYYY-MM-DD' format."),
    type: z.string().describe("The type of workout (e.g., 'Full Body Strength', 'Cardio & Core')."),
    duration: z.string().describe("The duration of the workout (e.g., '45 min', '1 hour')."),
});

export type RecentWorkout = z.infer<typeof RecentWorkoutSchema>;

const RecentWorkoutsOutputSchema = z.object({
  workouts: z.array(RecentWorkoutSchema).describe('A list of 3 recent, varied workout sessions.'),
});

export type RecentWorkoutsOutput = z.infer<typeof RecentWorkoutsOutputSchema>;


export async function generateRecentWorkouts(): Promise<RecentWorkoutsOutput> {
  return generateRecentWorkoutsFlow();
}

const prompt = ai.definePrompt({
  name: 'generateRecentWorkoutsPrompt',
  output: { schema: RecentWorkoutsOutputSchema },
  prompt: `You are an AI that generates realistic fitness data.
Create a list of 3 recent workout sessions for a user.
The workouts should be varied, covering different types like strength, cardio, and flexibility.
The dates should be recent and sequential, as if the user is working out consistently.
The durations should be realistic for each type of workout.
Format the dates as 'YYYY-MM-DD'.

Example Output:
- date: "2024-07-28", type: "Full Body Strength", duration: "60 min"
- date: "2024-07-26", type: "Cardio & Core", duration: "45 min"
- date: "2024-07-24", type: "Upper Body Power", duration: "55 min"

Generate a new, unique set of recent workouts now.
`,
});

const generateRecentWorkoutsFlow = ai.defineFlow(
  {
    name: 'generateRecentWorkoutsFlow',
    outputSchema: RecentWorkoutsOutputSchema,
  },
  async () => {
    const { output } = await prompt();
    return output!;
  }
);
