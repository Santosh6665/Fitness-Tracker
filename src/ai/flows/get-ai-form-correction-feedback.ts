
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetAiFormCorrectionFeedbackInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video of the user performing an exercise, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>' using a video/* mime type."
    ),
  exerciseName: z.string().describe('The name of the exercise being performed.'),
});
export type GetAiFormCorrectionFeedbackInput = z.infer<typeof GetAiFormCorrectionFeedbackInputSchema>;

const GetAiFormCorrectionFeedbackOutputSchema = z.object({
  feedback: z.string().describe('AI feedback on the user\'s exercise form.'),
});
export type GetAiFormCorrectionFeedbackOutput = z.infer<typeof GetAiFormCorrectionFeedbackOutputSchema>;

export async function getAiFormCorrectionFeedback(input: GetAiFormCorrectionFeedbackInput): Promise<GetAiFormCorrectionFeedbackOutput> {
  return getAiFormCorrectionFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getAiFormCorrectionFeedbackPrompt',
  input: {schema: GetAiFormCorrectionFeedbackInputSchema},
  output: {schema: GetAiFormCorrectionFeedbackOutputSchema},
  prompt: `You are a personal trainer providing feedback on exercise form.

You will watch the provided video of a user performing the following exercise: {{{exerciseName}}}.

You will provide feedback to the user on their form, and suggestions for improvement.

Analyze the following video:

{{media url=videoDataUri}}
`,
});

const getAiFormCorrectionFeedbackFlow = ai.defineFlow(
  {
    name: 'getAiFormCorrectionFeedbackFlow',
    inputSchema: GetAiFormCorrectionFeedbackInputSchema,
    outputSchema: GetAiFormCorrectionFeedbackOutputSchema,
    model: 'gemini-2.5-flash-lite',
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
