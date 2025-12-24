
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CalculateJourneyInputSchema = z.object({
  startLocation: z.string().describe('The starting point of the journey.'),
  endLocation: z.string().describe('The destination of the journey.'),
});
export type CalculateJourneyInput = z.infer<
  typeof CalculateJourneyInputSchema
>;

const CalculateJourneyOutputSchema = z.object({
  distance: z
    .number()
    .describe('The estimated distance of the journey in kilometers.'),
  steps: z
    .number()
    .describe('The estimated number of steps for the journey.'),
});
export type CalculateJourneyOutput = z.infer<
  typeof CalculateJourneyOutputSchema
>;

export async function calculateJourney(
  input: CalculateJourneyInput
): Promise<CalculateJourneyOutput> {
  return calculateJourneyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateJourneyPrompt',
  input: { schema: CalculateJourneyInputSchema },
  output: { schema: CalculateJourneyOutputSchema },
  prompt: `You are a mapping and distance calculation expert.
A user wants to know the distance and estimated steps for a journey.
Assume an average walking speed and step length to provide a realistic estimation.
An average person takes about 1,300 to 1,500 steps per kilometer. Use this to estimate steps.

Calculate the journey details for the following:
Start: {{{startLocation}}}
End: {{{endLocation}}}

Provide only the estimated distance in kilometers and the total steps. Your calculation should be a realistic simulation. For example, a trip across a city might be 5-10km, while a trip across a country would be thousands.
`,
});

const calculateJourneyFlow = ai.defineFlow(
  {
    name: 'calculateJourneyFlow',
    inputSchema: CalculateJourneyInputSchema,
    outputSchema: CalculateJourneyOutputSchema,
    model: 'gemini-1.5-flash-latest',
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
