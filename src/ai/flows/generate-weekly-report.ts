
'use server';
/**
 * @fileOverview A Genkit flow for generating a weekly fitness report.
 *
 * - generateWeeklyReport: Generates a summary and title for a user's weekly activity.
 * - GenerateWeeklyReportInput: The input type for the flow.
 * - GenerateWeeklyReportOutput: The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WeeklyActivityItemSchema = z.object({
    day: z.string(),
    workouts: z.number().describe("Number of workout sessions on that day."),
    duration: z.number().describe("Total workout duration in minutes for that day."),
});

const GenerateWeeklyReportInputSchema = z.object({
  weeklyActivity: z.array(WeeklyActivityItemSchema).describe("The user's workout data for the last 7 days."),
});
export type GenerateWeeklyReportInput = z.infer<typeof GenerateWeeklyReportInputSchema>;


const GenerateWeeklyReportOutputSchema = z.object({
  title: z.string().describe("A short, engaging title for the weekly report (e.g., 'Solid Week of Progress!')."),
  summary: z.string().describe("A 2-3 sentence summary of the user's weekly performance, highlighting consistency, total activity, and a motivational tip for the next week. Use newline characters for formatting."),
});
export type GenerateWeeklyReportOutput = z.infer<typeof GenerateWeeklyReportOutputSchema>;


export async function generateWeeklyReport(input: GenerateWeeklyReportInput): Promise<GenerateWeeklyReportOutput> {
  return generateWeeklyReportFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateWeeklyReportPrompt',
  input: { schema: GenerateWeeklyReportInputSchema },
  output: { schema: GenerateWeeklyReportOutputSchema },
  prompt: `You are an encouraging and insightful AI fitness coach.
Analyze the user's workout data for the past week.
Based on the data, generate a short, motivating title and a 2-3 sentence summary of their performance.
In the summary, comment on their consistency (how many days they worked out).
Mention their total workout duration for the week.
Provide a positive and encouraging tip for the upcoming week.
Format the summary with newline characters to create paragraphs.

Weekly Activity Data:
{{#each weeklyActivity}}
- {{day}}: {{workouts}} workout(s), {{duration}} minutes
{{/each}}

Generate the report now.
`,
});


const generateWeeklyReportFlow = ai.defineFlow(
  {
    name: 'generateWeeklyReportFlow',
    inputSchema: GenerateWeeklyReportInputSchema,
    outputSchema: GenerateWeeklyReportOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
