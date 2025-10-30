'use server';

/**
 * @fileOverview A class faculty mapping AI agent.
 *
 * - generateClassFacultyMapping - A function that generates class faculty mappings based on a prompt.
 * - GenerateClassFacultyMappingInput - The input type for the generateClassFacultyMapping function.
 * - GenerateClassFacultyMappingOutput - The return type for the generateClassFacultyMapping function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateClassFacultyMappingInputSchema = z.object({
  prompt: z.string().describe('A description of the class faculty mappings to generate.'),
});
export type GenerateClassFacultyMappingInput = z.infer<typeof GenerateClassFacultyMappingInputSchema>;

const GenerateClassFacultyMappingOutputSchema = z.object({
  mappings: z.array(
    z.object({
      class_name: z.string().describe('The name of the class.'),
      faculty_id: z.string().describe('The ID of the faculty member.'),
      subject: z.string().describe('The subject being taught.'),
    })
  ).describe('An array of class faculty mappings.'),
});
export type GenerateClassFacultyMappingOutput = z.infer<typeof GenerateClassFacultyMappingOutputSchema>;

export async function generateClassFacultyMapping(input: GenerateClassFacultyMappingInput): Promise<GenerateClassFacultyMappingOutput> {
  return generateClassFacultyMappingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateClassFacultyMappingPrompt',
  input: {schema: GenerateClassFacultyMappingInputSchema},
  output: {schema: GenerateClassFacultyMappingOutputSchema},
  prompt: `You are an AI assistant that generates class faculty mappings.

  Based on the provided prompt, generate a list of class faculty mappings, where each mapping includes the class name, faculty ID, and subject.

  The output should be a JSON array of class faculty mappings.

  Prompt: {{{prompt}}}
  `,
});

const generateClassFacultyMappingFlow = ai.defineFlow(
  {
    name: 'generateClassFacultyMappingFlow',
    inputSchema: GenerateClassFacultyMappingInputSchema,
    outputSchema: GenerateClassFacultyMappingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
