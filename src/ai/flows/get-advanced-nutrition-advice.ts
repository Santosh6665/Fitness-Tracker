
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GetAdvancedNutritionAdviceInputSchema = z.object({
  requestType: z.enum(['supplements', 'recipe', 'meal_prep']),
  ingredients: z.string().optional().describe('A comma-separated list of ingredients the user has.'),
  mealPlan: z.string().optional().describe('A simple meal plan to generate a shopping list from.'),
});

export type GetAdvancedNutritionAdviceInput = z.infer<typeof GetAdvancedNutritionAdviceInputSchema>;

const GetAdvancedNutritionAdviceOutputSchema = z.object({
  response: z.string().describe('The AI-generated advice in Markdown format.'),
});

export type GetAdvancedNutritionAdviceOutput = z.infer<typeof GetAdvancedNutritionAdviceOutputSchema>;

export async function getAdvancedNutritionAdvice(input: GetAdvancedNutritionAdviceInput): Promise<GetAdvancedNutritionAdviceOutput> {
  return getAdvancedNutritionAdviceFlow(input);
}

const supplementPrompt = `You are a cautious and responsible AI nutrition advisor.
Provide a brief overview of common supplements for general fitness goals.
Emphasize that this is not medical advice and the user should consult a healthcare professional before taking any supplements.
Structure the response in Markdown.`;

const recipePrompt = `You are an expert chef. Based on the following ingredients, generate a simple and healthy recipe.
Ingredients: {{{ingredients}}}

Provide the recipe in Markdown format, including a title, ingredients list, and step-by-step instructions.
If the ingredients are insufficient for a full meal, state that and suggest what else might be needed.`;

const mealPrepPrompt = `You are an organized meal prep assistant.
Based on the following simple meal plan, generate a categorized shopping list in Markdown format.
Combine quantities of the same item.

Meal Plan:
{{{mealPlan}}}`;


const getAdvancedNutritionAdviceFlow = ai.defineFlow(
  {
    name: 'getAdvancedNutritionAdviceFlow',
    inputSchema: GetAdvancedNutritionAdviceInputSchema,
    outputSchema: GetAdvancedNutritionAdviceOutputSchema,
  },
  async (input) => {
    let promptText = '';
    switch (input.requestType) {
      case 'supplements':
        promptText = supplementPrompt;
        break;
      case 'recipe':
        promptText = recipePrompt.replace('{{{ingredients}}}', input.ingredients || '');
        break;
      case 'meal_prep':
        promptText = mealPrepPrompt.replace('{{{mealPlan}}}', input.mealPlan || '');
        break;
    }

    const { text } = await ai.generate({
      prompt: promptText,
    });
    
    if (!text) {
        throw new Error('Failed to generate a response from the AI.');
    }

    return { response: text };
  }
);
