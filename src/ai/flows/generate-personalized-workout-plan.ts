'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating personalized workout plans.
 *
 * The flow takes user's fitness goals, experience level, and available equipment as input,
 * and generates a personalized workout plan.
 *
 * @fileOverview
 * - `generatePersonalizedWorkoutPlan`: The main function to trigger the workout plan generation flow.
 * - `PersonalizedWorkoutPlanInput`: Interface defining the input schema for the flow.
 * - `PersonalizedWorkoutPlanOutput`: Interface defining the output schema for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedWorkoutPlanInputSchema = z.object({
  fitnessGoals: z
    .string()
    .describe(
      'The user fitness goals, such as weight loss, muscle gain, or improved endurance.'
    ),
  experienceLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The user experience level in fitness.'),
  availableEquipment: z
    .string()
    .describe(
      'A comma-separated list of equipment available to the user, or \'none\'.' + 'If specifying equipment, be very specific.'
    ),
});

export type PersonalizedWorkoutPlanInput = z.infer<
  typeof PersonalizedWorkoutPlanInputSchema
>;

const PersonalizedWorkoutPlanOutputSchema = z.object({
  workoutPlan: z
    .string()
    .describe(
      'A detailed workout plan tailored to the user fitness goals, experience level, and available equipment.'
    ),
});

export type PersonalizedWorkoutPlanOutput = z.infer<
  typeof PersonalizedWorkoutPlanOutputSchema
>;

export async function generatePersonalizedWorkoutPlan(
  input: PersonalizedWorkoutPlanInput
): Promise<PersonalizedWorkoutPlanOutput> {
  return generatePersonalizedWorkoutPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedWorkoutPlanPrompt',
  input: {schema: PersonalizedWorkoutPlanInputSchema},
  output: {schema: PersonalizedWorkoutPlanOutputSchema},
  prompt: `You are an expert fitness trainer. Generate a personalized workout plan based on the user's fitness goals, experience level, and available equipment. Make sure to include specific exercises with sets and reps. Use a variety of exercises to target different muscle groups. Format the output in markdown for readability.

Fitness Goals: {{{fitnessGoals}}}
Experience Level: {{{experienceLevel}}}
Available Equipment: {{{availableEquipment}}}

Workout Plan:`,
});

const generatePersonalizedWorkoutPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedWorkoutPlanFlow',
    inputSchema: PersonalizedWorkoutPlanInputSchema,
    outputSchema: PersonalizedWorkoutPlanOutputSchema,
    model: 'gemini-1.5-pro-latest',
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
