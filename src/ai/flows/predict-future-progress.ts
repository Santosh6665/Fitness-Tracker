
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ProgressDataItemSchema = z.object({
  month: z.string(),
  weight: z.number(),
  squat: z.number(),
  calories: z.number(),
  workouts: z.number(),
});

const PredictFutureProgressInputSchema = z.object({
  history: z.array(ProgressDataItemSchema).describe("The user's historical fitness progression data over several months."),
  goals: z.array(z.string()).describe("A list of the user's primary fitness goals (e.g., 'weight_loss', 'muscle_gain')."),
});
export type PredictFutureProgressInput = z.infer<typeof PredictFutureProgressInputSchema>;

const PredictFutureProgressOutputSchema = z.object({
  prediction: z.string().describe("A concise, one or two sentence prediction about the user's future fitness progress based on their historical data and goals."),
});
export type PredictFutureProgressOutput = z.infer<typeof PredictFutureProgressOutputSchema>;


export async function predictFutureProgress(input: PredictFutureProgressInput): Promise<PredictFutureProgressOutput> {
  return predictFutureProgressFlow(input);
}


const prompt = ai.definePrompt({
  name: 'predictFutureProgressPrompt',
  input: { schema: PredictFutureProgressInputSchema },
  output: { schema: PredictFutureProgressOutputSchema },
  prompt: `You are a data scientist and an encouraging fitness coach.
Analyze the following historical fitness data which shows a user's progress over several months.
Their stated goals are: {{#each goals}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.

Based on the trends in the data AND their stated goals, provide a short, motivating, and realistic prediction for their progress over the next 1-2 months.
Focus on a key metric that aligns with one of their main goals. For example, if their goal is 'weight_loss', focus on their weight trend. If it's 'muscle_gain', you could look at their squat progress.

Historical Data:
{{#each history}}
- Month: {{month}}, Body Weight: {{weight}}kg, Squat: {{squat}}kg, Avg Daily Calories: {{calories}}, Workouts: {{workouts}}
{{/each}}

Generate a single, concise prediction now.
`,
});


const predictFutureProgressFlow = ai.defineFlow(
  {
    name: 'predictFutureProgressFlow',
    inputSchema: PredictFutureProgressInputSchema,
    outputSchema: PredictFutureProgressOutputSchema,
    model: 'gemini-1.5-flash-latest',
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
