
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ProcessOnboardingInputSchema = z.object({
  age: z.number().describe('The user\'s age.'),
  gender: z.enum(['male', 'female', 'other']).describe('The user\'s gender.'),
  weight: z.number().describe('The user\'s weight in kilograms.'),
  height: z.number().describe('The user\'s height in centimeters.'),
  fitnessLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The user\'s self-assessed fitness level.'),
  goals: z.array(z.string()).describe('A list of the user\'s fitness goals.'),
});

export type ProcessOnboardingInput = z.infer<typeof ProcessOnboardingInputSchema>;

const ProcessOnboardingOutputSchema = z.object({
  welcomeMessage: z.string().describe("A personalized, encouraging welcome message for the user."),
  initialSummary: z.string().describe("A brief summary of the user's profile and what the AI recommends next."),
});

export type ProcessOnboardingOutput = z.infer<typeof ProcessOnboardingOutputSchema>;


export async function processOnboarding(
  input: ProcessOnboardingInput
): Promise<ProcessOnboardingOutput> {
  return processOnboardingFlow(input);
}


const prompt = ai.definePrompt({
    name: 'processOnboardingPrompt',
    input: { schema: ProcessOnboardingInputSchema },
    output: { schema: ProcessOnboardingOutputSchema },
    prompt: `You are an encouraging and motivating AI fitness coach.
A new user has just completed their onboarding questionnaire.
Your task is to analyze their profile and generate a personalized welcome message and a brief summary.

User Profile:
- Age: {{age}}
- Gender: {{gender}}
- Weight: {{weight}} kg
- Height: {{height}} cm
- Fitness Level: {{fitnessLevel}}
- Main Goals: {{#each goals}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Based on this, generate a response.
The welcome message should be enthusiastic and make them feel excited to start.
The initial summary should briefly acknowledge their goals and fitness level, and state that you will create a personalized plan for them.
Keep the tone positive and empowering.
`,
});


const processOnboardingFlow = ai.defineFlow(
  {
    name: 'processOnboardingFlow',
    inputSchema: ProcessOnboardingInputSchema,
    outputSchema: ProcessOnboardingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
