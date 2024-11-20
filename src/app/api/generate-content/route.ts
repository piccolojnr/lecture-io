import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { encode } from 'gpt-tokenizer';

const CHUNK_SIZE = 1800;

function splitTextIntoChunks(text: string, maxTokens: number = CHUNK_SIZE): string[] {
  const tokens = encode(text);
  const chunks: number[][] = [];
  let currentChunk: number[] = [];

  for (const token of tokens) {
    currentChunk.push(token);
    if (currentChunk.length >= maxTokens) {
      chunks.push(currentChunk);
      currentChunk = [];
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks.map(chunk => 
    chunk.map(token => String.fromCharCode(token)).join('')
  );
}

const quizPrompt = (chunk: string) => `
Convert the following text into a set of quiz questions in JSON format using the structure strictly as specified below. 
You must not deviate from the format. Make sure to include all relevant information from the provided text that pertains 
to the lecture (e.g., key points, concepts, and examples).

The quiz format is as follows:

[
  {
    "question": "<Quiz question>",
    "options": ["<Option 1>", "<Option 2>", "<Option 3>", "<Option 4>"],
    "correctAnswer": "<Correct option>",
    "topic": "<Topic title>",
    "explanation": "<Optional explanation>"
  }
]

Instructions for Quiz Generation:
1. Each quiz question should be phrased clearly and relate to key concepts from the lecture.
2. Provide four answer options for each question, one of which should be the correct answer.
3. The correctAnswer field should indicate the correct option.
4. Topic should reflect the general area that the question covers.
5. Explanation is optional but recommended for complex topics.
6. Strictly use the given format without deviating from it.

Text Chunk:

${chunk}`;

const flashcardPrompt = (chunk: string) => `
Convert the following text into a set of flashcards in JSON format using the structure strictly as specified below. 
You must not deviate from the format. Make sure to include all relevant information from the provided text that pertains 
to the lecture (e.g., key points, concepts, and examples).

The flashcard format is as follows:

[
  {
    "question": "<Flashcard question>",
    "answer": "<Flashcard answer>",
    "topic": "<Topic title>",
    "additionalNotes": "<Optional notes>"
  }
]

Instructions for Flashcard Generation:
1. Each flashcard should contain a clear question and comprehensive answer.
2. Topic should reflect the general area covered.
3. AdditionalNotes can include examples or clarifications.
4. Break down complex topics into multiple flashcards for clarity.
5. Strictly use the given format without deviating from it.

Text Chunk:

${chunk}`;

async function processChunkWithAI(chunk: string, type: 'quiz' | 'flashcard', apiKey: string) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const prompt = type === 'quiz' ? quizPrompt(chunk) : flashcardPrompt(chunk);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful educational content generator.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      response_format: {
        type: 'json_object',
        options: { strip_output_prefix: true }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, type, apiKey } = await req.json();
    if (!text || !type || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const chunks = splitTextIntoChunks(text);
    const results = [];
    const failedChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      try {
        const result = await processChunkWithAI(chunks[i], type, apiKey);
        results.push(...result);
      } catch (error) {
        console.error(`Failed to process chunk ${i}:`, error);
        failedChunks.push(i);
      }

      // Add delay between chunks to respect rate limits
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      results,
      failedChunks,
      totalChunks: chunks.length
    });

  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
