
'use server';
/**
 * @fileOverview A Genkit flow for providing contextual nutrition insights.
 *
 * This flow can generate various types of nutritional tips and recommendations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GetNutritionInsightInputSchema = z.object({
  insightType: z.enum(['meal_timing', 'habit_suggestion', 'hydration_reminder', 'random']).describe('The type of insight to generate.'),
});

export type GetNutritionInsightInput = z.infer<typeof GetNutritionInsightInputSchema>;

const GetNutritionInsightOutputSchema = z.object({
  insight: z.string().describe('A concise, actionable insight or recommendation.'),
});

export type GetNutritionInsightOutput = z.infer<typeof GetNutritionInsightOutputSchema>;

export async function getNutritionInsight(input: GetNutritionInsightInput): Promise<GetNutritionInsightOutput> {
  return getNutritionInsightFlow(input);
}

const prompts = {
    meal_timing: "Provide a random, actionable tip about meal timing for better fitness results. For example, 'Consider eating a mix of protein and carbs 1-2 hours before your workout for sustained energy.' or 'A protein-rich snack after your workout can help with muscle recovery.'",
    habit_suggestion: "Analyze a common negative eating habit and suggest a positive alternative. For example, 'Instead of reaching for a sugary snack in the afternoon, try a handful of almonds or a piece of fruit to keep your energy levels stable.' or 'If you often skip breakfast, a simple protein smoothie can be a quick and healthy way to start your day.'",
    hydration_reminder: "Generate a creative and motivating reminder to drink water. For example, 'Your body is working hard! Don\\'t forget to hydrate to help it recover and perform at its best.' or 'A glass of water now can boost your focus and energy for the next hour.'",
    random: "Provide a random, interesting, and helpful nutrition tip for someone on a fitness journey."
};


const getNutritionInsightFlow = ai.defineFlow(
  {
    name: 'getNutritionInsightFlow',
    inputSchema: GetNutritionInsightInputSchema,
    outputSchema: GetNutritionInsightOutputSchema,
  },
  async ({ insightType }) => {
    let promptText = prompts[insightType];
    
    if (insightType === 'random') {
        const randomChoice = (Object.keys(prompts) as (keyof typeof prompts)[]).filter(k => k !== 'random');
        const chosenKey = randomChoice[Math.floor(Math.random() * randomChoice.length)];
        promptText = prompts[chosenKey];
    }

    const { text } = await ai.generate({
      prompt: `You are a friendly and knowledgeable AI nutrition coach. A user wants a quick insight. Generate a single, concise, and actionable tip based on the following instruction: ${promptText}`,
    });

    if (!text) {
        throw new Error('Failed to generate insight.');
    }
    
    return { insight: text };
  }
);
