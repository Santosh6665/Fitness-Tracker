
'use server';
/**
 * @fileOverview This file defines a Genkit flow for a voice-based AI fitness coach.
 *
 * It transcribes user audio, generates a text response from an AI coach,
 * and converts that response back to audio.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const GetAiCoachResponseInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A voice recording from the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:audio/webm;base64,<encoded_data>'."
    ),
});
export type GetAiCoachResponseInput = z.infer<
  typeof GetAiCoachResponseInputSchema
>;

const GetAiCoachResponseOutputSchema = z.object({
  userQuery: z.string().describe('The transcribed text from the user audio.'),
  coachResponseText: z
    .string()
    .describe("The AI coach's text response."),
  coachResponseAudioUri: z
    .string()
    .describe("The AI coach's audio response, as a data URI."),
});
export type GetAiCoachResponseOutput = z.infer<
  typeof GetAiCoachResponseOutputSchema
>;

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const coachPrompt = ai.definePrompt({
  name: 'coachPrompt',
  input: {
    schema: z.object({ query: z.string() }),
  },
  prompt: `You are an AI fitness coach named 'Fitness Compass'.
You are friendly, encouraging, and knowledgeable about all aspects of fitness, nutrition, and wellness.
Keep your answers concise and to the point (2-3 sentences).
You cannot access real-time data, workouts, or user's personal information.
If asked about today's workout, suggest a type of workout (e.g., "a full-body strength session" or "a light cardio and stretching day") instead of specific exercises.
Do not ask follow-up questions.

User's question: "{{{query}}}"`,
});

const getAiCoachResponseFlow = ai.defineFlow(
  {
    name: 'getAiCoachResponseFlow',
    inputSchema: GetAiCoachResponseInputSchema,
    outputSchema: GetAiCoachResponseOutputSchema,
  },
  async (input) => {
    // 1. Transcribe Audio to Text
    const { text: userQuery } = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: [
        { text: 'Transcribe the following audio.'},
        { media: { url: input.audioDataUri } }
      ],
    });

    if (!userQuery) {
      throw new Error('Audio transcription failed.');
    }

    // 2. Generate Text Response from Coach
    const { output: coachResponse } = await coachPrompt({ query: userQuery });
    const coachResponseText = coachResponse?.text;

    if (!coachResponseText) {
      throw new Error('Coach response generation failed.');
    }

    // 3. Convert Coach's Text Response to Speech
    const { media: audioResponse } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      prompt: coachResponseText,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algenib' } },
        },
      },
    });

    if (!audioResponse) {
      throw new Error('Text-to-speech generation failed.');
    }

    const audioBuffer = Buffer.from(
      audioResponse.url.substring(audioResponse.url.indexOf(',') + 1),
      'base64'
    );
    const wavAudioBase64 = await toWav(audioBuffer);

    return {
      userQuery,
      coachResponseText,
      coachResponseAudioUri: `data:audio/wav;base64,${wavAudioBase64}`,
    };
  }
);

export async function getAiCoachResponse(
  input: GetAiCoachResponseInput
): Promise<GetAiCoachResponseOutput> {
  return getAiCoachResponseFlow(input);
}
