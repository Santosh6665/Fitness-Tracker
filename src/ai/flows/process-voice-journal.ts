
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const ProcessVoiceJournalInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A voice recording from the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:audio/webm;base64,<encoded_data>'."
    ),
});
export type ProcessVoiceJournalInput = z.infer<
  typeof ProcessVoiceJournalInputSchema
>;

const ProcessVoiceJournalOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio.'),
  mood: z
    .enum(['Positive', 'Negative', 'Neutral'])
    .describe('The analyzed mood from the transcription.'),
  summary: z.string().describe('A brief summary of the journal entry.'),
});
export type ProcessVoiceJournalOutput = z.infer<
  typeof ProcessVoiceJournalOutputSchema
>;

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 48000,
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

const moodAnalysisPrompt = ai.definePrompt({
  name: 'moodAnalysisPrompt',
  input: {
    schema: z.object({ transcription: z.string() }),
  },
  output: {
    schema: ProcessVoiceJournalOutputSchema.pick({ mood: true, summary: true }),
  },
  prompt: `You are an expert in sentiment analysis. Analyze the following journal entry to determine the user's overall mood. The mood must be one of 'Positive', 'Negative', or 'Neutral'. Also, provide a concise one-sentence summary of the entry.

Journal Entry:
"{{{transcription}}}"`,
});

const processVoiceJournalFlow = ai.defineFlow(
  {
    name: 'processVoiceJournalFlow',
    inputSchema: ProcessVoiceJournalInputSchema,
    outputSchema: ProcessVoiceJournalOutputSchema,
  },
  async (input) => {
    const { text: transcription } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-lite',
      prompt: [
        { text: 'Transcribe the following audio.'},
        {
          media: {
            url: input.audioDataUri,
          },
        },
      ],
    });

    if (!transcription) {
      throw new Error('Audio transcription failed.');
    }

    const { output } = await moodAnalysisPrompt({ transcription });
    if (!output) {
      throw new Error('Mood analysis failed.');
    }
    
    return {
      transcription,
      mood: output.mood,
      summary: output.summary,
    };
  }
);

export async function processVoiceJournal(
  input: ProcessVoiceJournalInput
): Promise<ProcessVoiceJournalOutput> {
  return processVoiceJournalFlow(input);
}
