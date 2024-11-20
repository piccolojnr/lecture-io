import { HfInference } from '@huggingface/inference';
import { NextResponse } from 'next/server';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Context injection for better educational responses
    const context = `You are an AI study assistant helping a student. 
    Focus on providing clear explanations, examples, and study tips.
    Current question: ${message}`;

    const response = await hf.textGeneration({
      model: 'google/flan-t5-xxl',
      inputs: context,
      parameters: {
        max_length: 200,
        temperature: 0.7,
      },
    });

    return NextResponse.json({ response: response.generated_text });
  } catch (error) {
    console.error('AI Assistant Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
