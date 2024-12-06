import { decode, encode } from "gpt-tokenizer";

export const CHUNK_SIZE = 1800;
export const RETRY_CONFIG = {
    MAX_RETRIES: 3,
    BASE_DELAY: 1000,
    MAX_DELAY: 10000,
    JITTER: 0.1
} as const;

export const quizPrompt = (chunk: string) => `
Convert the following text into a set of quiz questions in JSON format using the structure strictly as specified below. 
You must not deviate from the format. Make sure to include all relevant information from the provided text that pertains 
to the lecture (e.g., key points, concepts, examples, and mathematical equations). If the chunk is empty or only lists topics, 
generate quiz questions using those topics as guidance.

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
1. Each quiz question should be phrased clearly and relate to key concepts, examples, or mathematical problems from the lecture.
2. Provide four answer options for each question, one of which should be the correct answer.
3. The correctAnswer field should indicate the correct option.
4. Topic should reflect the general area that the question covers.
5. Explanation is optional but recommended for complex topics or math problems.
6. If mathematical content is included, format equations properly using LaTeX syntax (e.g., \\( a^2 + b^2 = c^2 \\)).
7. If the chunk is empty or only lists topics, create questions covering core aspects or key points related to those topics.
8. Strictly use the given format without deviating from it.
9. Explanation must not exceed 500 characters.
10. Topic must be at least 2 characters long.
11. If mathematical content is included, add a lot of solved examples.
12. Try to cover every thing in the chunk if possible and meet the requirements.

Text Chunk:

${chunk}`;

export const flashcardPrompt = (chunk: string) => `
Convert the following text into a set of flashcards in JSON format using the structure strictly as specified below. 
You must not deviate from the format. Make sure to include all relevant information from the provided text that pertains 
to the lecture (e.g., key points, concepts, examples, and mathematical equations). If the chunk is empty or only lists topics, 
generate flashcards based on those topics.

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
3. AdditionalNotes can include examples, clarifications, or mathematical equations formatted in LaTeX syntax (e.g., \\( E = mc^2 \\)).
4. Break down complex topics or math problems into multiple flashcards for clarity.
5. If the chunk is empty or only lists topics, create flashcards that provide foundational understanding or cover essential aspects of those topics.
6. Strictly use the given format without deviating from it.
7. Additional notes must not exceed 500 characters.
8. Topic must be at least 2 characters long.
9. If mathematical content is included, format equations properly using LaTeX syntax.
10. mathematical content add a lot of solved examples
11. If the chunk is empty or only lists topics, create flashcards covering core aspects or key points related to those topics.
12. Try to keep the answer concise and to the point.
13. try to cover every thing in the chunk if possible and meet the requirements

Text Chunk:

${chunk}`;

// Calculate delay with exponential backoff and jitter
function calculateRetryDelay(attempt: number): number {
    const exponentialDelay = Math.min(
        RETRY_CONFIG.BASE_DELAY * Math.pow(2, attempt),
        RETRY_CONFIG.MAX_DELAY
    );

    // Add jitter to prevent thundering herd
    const jitter = exponentialDelay * RETRY_CONFIG.JITTER * Math.random();
    return exponentialDelay + jitter;
}

// Enhanced error handling
interface AIError extends Error {
    status?: number;
    retryAfter?: number;
    isTransient?: boolean;
}

function isRetryableError(error: AIError): boolean {
    // Retry on rate limits and specific error codes
    if (error.status === 429) return true;
    if (error.status && [500, 502, 503, 504].includes(error.status)) return true;

    // Retry on network errors
    if (error.message.includes('network') || error.message.includes('timeout')) return true;

    return false;
}

// Process a single chunk with enhanced retry logic
export async function processChunkWithAI(
    chunk: string,
    type: 'quiz' | 'flashcard',
    apiKey: string,
    attempt = 0
): Promise<any> {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const prompt = type === 'quiz' ? quizPrompt(chunk) : flashcardPrompt(chunk);

    try {
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
                temperature: 0.7, // Add some randomness to avoid repetitive outputs
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const error: AIError = new Error(`API request failed: ${response.statusText}`);
            error.status = response.status;


            // Extract retry-after header if present
            const retryAfter = response.headers.get('retry-after');
            if (retryAfter) {
                error.retryAfter = parseInt(retryAfter) * 1000;
            } else {
                const result = await response.json();
                if (!result.error?.failed_generation) {
                    throw new Error('Invalid response structure from API');
                }
                const content: string = result.error.failed_generation;

                try {
                    const parsedContent = JSON.parse("[" + content + "]");
                    return parsedContent;
                } catch (parseError) {
                    throw new Error(`Failed to parse API response: ${(parseError as any).message}`);
                }
            }

            throw error;
        }

        const result = await response.json();
        if (!result.choices?.[0]?.message?.content) {
            throw new Error('Invalid response structure from API');
        }

        const content: string = result.choices[0].message.content;


        // Parse and validate the content
        try {
            const parsedContent = JSON.parse(content);
            if (!Array.isArray(parsedContent)) {
                return parsedContent[type === 'quiz' ? 'quizzes' : 'flashcards'];
            }
            return parsedContent;
        } catch (parseError) {
            throw new Error(`Failed to parse API response: ${(parseError as any).message}`);
        }

    } catch (error: any) {
        const aiError: AIError = error;
        console.error(`Error processing chunk (attempt ${attempt + 1}):`, error);

        // Check if we should retry
        if (attempt < RETRY_CONFIG.MAX_RETRIES && isRetryableError(aiError)) {
            const retryDelay = aiError.retryAfter || calculateRetryDelay(attempt);
            console.warn(`Retrying chunk after ${retryDelay}ms (attempt ${attempt + 1})...`);

            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return processChunkWithAI(chunk, type, apiKey, attempt + 1);
        }

        throw error;
    }
}

// Process multiple chunks with concurrent execution
export async function processChunksWithAI(
    chunks: string[],
    type: 'quiz' | 'flashcard',
    apiKey: string,
    onProgress?: (current: number, total: number) => void
): Promise<{ results: any[], failedChunks: number[] }> {
    const results: any[] = [];
    const failedChunks: number[] = [];
    let completed = 0;

    // Process chunks in batches to avoid overwhelming the API
    const BATCH_SIZE = 3;
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map((chunk, index) =>
            processChunkWithAI(chunk, type, apiKey)
                .then(result => {
                    results.push(...(Array.isArray(result) ? result : [result]));
                    completed++;
                    onProgress?.(completed, chunks.length);
                })
                .catch(error => {
                    console.error(`Failed to process chunk ${i + index}:`, error);
                    failedChunks.push(i + index);
                    completed++;
                    onProgress?.(completed, chunks.length);
                })
        );

        await Promise.all(batchPromises);

        // Add a small delay between batches
        if (i + BATCH_SIZE < chunks.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return { results, failedChunks };
}

export function extractRetryTimeInMs(message: string): number | null {
    const match = message.match(/Please try again in ([\d.]+)(s|ms)/);
    if (match) {
        const timeValue = parseFloat(match[1]);
        const unit = match[2];
        if (unit === 's') {
            return timeValue * 1000; // Convert seconds to milliseconds
        } else if (unit === 'ms') {
            return timeValue; // Already in milliseconds
        }
    }
    return null; // Return null if no match found
}

export function splitTextIntoChunks(text: string, maxTokens: number = CHUNK_SIZE): string[] {
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

    // Properly decode tokens back to text
    return chunks.map(chunk => decode(chunk));
}