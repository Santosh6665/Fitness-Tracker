
'use server';
/**
 * @fileOverview An AI agent that analyzes a meal from a photo and returns nutritional information.
 *
 * - analyzeMeal - A function that handles the meal analysis process.
 * - AnalyzeMealInput - The input type for the analyzeMeal function.
 * - AnalyzeMealOutput - The return type for the analyzeMeal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMealInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeMealInput = z.infer<typeof AnalyzeMealInputSchema>;

const AnalyzeMealOutputSchema = z.object({
    description: z.string().describe("A brief description of the identified meal."),
    calories: z.number().describe('The estimated total calories of the meal.'),
    protein: z.number().describe('The estimated grams of protein in the meal.'),
    carbs: z.number().describe('The estimated grams of carbohydrates in the meal.'),
    fats: z.number().describe('The estimated grams of fat in the meal.'),
});
export type AnalyzeMealOutput = z.infer<typeof AnalyzeMealOutputSchema>;

export async function analyzeMeal(input: AnalyzeMealInput): Promise<AnalyzeMealOutput> {
  return analyzeMealFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMealPrompt',
  input: {schema: AnalyzeMealInputSchema},
  output: {schema: AnalyzeMealOutputSchema},
  prompt: `You are an expert nutritionist. Analyze the image of the meal provided.
Identify the food items in the image and estimate the total nutritional content for the entire meal.
Provide a brief description of the meal and the estimated calories, protein, carbohydrates, and fats.

Analyze the following meal:

{{media url=imageDataUri}}
`,
});

const analyzeMealFlow = ai.defineFlow(
  {
    name: 'analyzeMealFlow',
    inputSchema: AnalyzeMealInputSchema,
    outputSchema: AnalyzeMealOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
