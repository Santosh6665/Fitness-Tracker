
'use server';
/**
 * @fileOverview A Genkit flow for predicting future fitness progress.
 *
 * This flow analyzes historical fitness data to forecast future trends.
 *
 * - predictFutureProgress: Generates a prediction based on progress data.
 * - PredictFutureProgressInput: The input type for the flow.
 * - PredictFutureProgressOutput: The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ProgressDataItemSchema = z.object({
  month: z.string(),
  weight: z.number(),
  squat: z.number(),
});

const PredictFutureProgressInputSchema = z.object({
  history: z.array(ProgressDataItemSchema).describe("The user's historical weight and squat progression data over several months."),
});
export type PredictFutureProgressInput = z.infer<typeof PredictFutureProgressInputSchema>;

const PredictFutureProgressOutputSchema = z.object({
  prediction: z.string().describe("A concise, one or two sentence prediction about the user's future fitness progress based on their historical data."),
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
Analyze the following historical fitness data which shows a user's weight and max squat weight over several months.
Based on the trends in this data, provide a short, motivating, and realistic prediction for their progress over the next 2-3 months.
Focus on one key metric, like their squat strength.

Historical Data:
{{#each history}}
- Month: {{month}}, Body Weight: {{weight}}kg, Squat: {{squat}}kg
{{/each}}

Generate a prediction now.
`,
});


const predictFutureProgressFlow = ai.defineFlow(
  {
    name: 'predictFutureProgressFlow',
    inputSchema: PredictFutureProgressInputSchema,
    outputSchema: PredictFutureProgressOutputSchema,
    model: 'gemini-1.5-pro-latest',
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

