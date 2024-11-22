import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { processChunkWithAI, } from '@/lib/ai-generator-lib';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chunks, type, apiKey } = await req.json();
    if (!chunks || !type || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!Array.isArray(chunks)) {
      return NextResponse.json({ error: 'Invalid chunks format' }, { status: 400 });
    }

    const results: any[] = [];
    let failedChunks: number[] = [];

    for (let i = 0; i < chunks.length; i++) {
      try {
        const result = await processChunkWithAI(chunks[i], type, apiKey);
        console.log(`Processed chunk ${result}`);
        results.push(...result);
      } catch (error) {
        console.error(`Failed to process chunk ${i}:`, error);
        failedChunks.push(i);
      }

      // Delay to respect API rate limits
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // retry failed chunks
    const retriedChunks: number[] = [];
    for (const i of failedChunks) {
      try {
        const result = await processChunkWithAI(chunks[i], type, apiKey);
        console.log(`Retried chunk ${i}`);
        results.push(...result);
        retriedChunks.push(i); // Track successfully retried chunks
      } catch (error) {
        console.error(`Failed to process chunk ${i} on retry:`, error);
      }
    }
    failedChunks = failedChunks.filter(i => !retriedChunks.includes(i));

    return NextResponse.json({
      success: true,
      results,
      failedChunks,
      totalChunks: chunks.length
    });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}