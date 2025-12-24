
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetPhysiqueAssessmentInputSchema = z.object({
  frontPhotoDataUri: z
    .string()
    .describe(
      "A front-view photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  sidePhotoDataUri: z
    .string()
    .describe(
      "A side-view photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GetPhysiqueAssessmentInput = z.infer<
  typeof GetPhysiqueAssessmentInputSchema
>;

const GetPhysiqueAssessmentOutputSchema = z.object({
  assessment: z
    .string()
    .describe(
      'A qualitative, descriptive analysis of the user\'s physique in Markdown format.'
    ),
});
export type GetPhysiqueAssessmentOutput = z.infer<
  typeof GetPhysiqueAssessmentOutputSchema
>;

export async function getPhysiqueAssessment(
  input: GetPhysiqueAssessmentInput
): Promise<GetPhysiqueAssessmentOutput> {
  return getPhysiqueAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getPhysiqueAssessmentPrompt',
  input: { schema: GetPhysiqueAssessmentInputSchema },
  output: { schema: GetPhysiqueAssessmentOutputSchema },
  prompt: `You are an expert fitness coach and kinesiologist providing a qualitative analysis of a user's physique based on two photos. Your tone is encouraging, positive, and educational.

**IMPORTANT RULES:**
1.  **DO NOT** provide any numerical estimations (e.g., body fat percentage, weight, measurements, ratios).
2.  **DO NOT** use negative or judgmental language. Focus on observable characteristics and potential areas for development.
3.  **DO NOT** give medical advice. Frame suggestions in the context of general fitness and aesthetics.
4.  Structure your response in Markdown with headings for different body regions (e.g., "Upper Body", "Core", "Lower Body", "Posture").
5.  Keep the analysis concise, focusing on 2-3 key observations.

**Analysis Task:**
Analyze the two images provided (front and side view). Provide a descriptive assessment focusing on aspects like muscular development, definition, and posture.

**Example Feedback:**
"### Upper Body
- Your shoulders appear well-developed, creating a strong V-taper shape from the front view.
- There is visible definition in your arms, indicating consistent training.
### Posture
- From the side view, your posture appears upright and stable, with your shoulders aligned over your hips. This is a great foundation for heavy lifting."

**User Images:**
- Front View: {{media url=frontPhotoDataUri}}
- Side View: {{media url=sidePhotoDataUri}}

Generate the assessment now.
`,
});

const getPhysiqueAssessmentFlow = ai.defineFlow(
  {
    name: 'getPhysiqueAssessmentFlow',
    inputSchema: GetPhysiqueAssessmentInputSchema,
    outputSchema: GetPhysiqueAssessmentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
