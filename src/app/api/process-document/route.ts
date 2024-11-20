import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileUrl, type, lectureId } = await req.json();

    if (!fileUrl || !type || !lectureId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch the file content
    const response = await fetch(fileUrl);
    const text = await response.text();

    // Process with OpenAI based on type
    let prompt = '';
    if (type === 'flashcards') {
      prompt = `Create a set of flashcards from the following text. Format as JSON array with "front" and "back" properties for each card. Focus on key concepts and definitions:\n\n${text}`;
    } else {
      prompt = `Create a quiz from the following text. Format as JSON array with "question", "options" (array of 4 choices), and "correctAnswer" (index of correct option) properties. Focus on testing understanding of key concepts:\n\n${text}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI that creates educational content. Respond only with valid JSON.",
        },
        { role: "user", content: prompt }
      ],
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Failed to generate content');
    }

    const parsedContent = JSON.parse(content);

    // Save to database based on type
    if (type === 'flashcards') {
      await prisma.flashcard.createMany({
        data: parsedContent.map((card: any) => ({
          front: card.front,
          back: card.back,
          lectureId: parseInt(lectureId),
          userId: session.user.id,
        })),
      });
    } else {
      await prisma.quiz.create({
        data: {
          lectureId: parseInt(lectureId),
          userId: session.user.id,
          questions: {
            create: parsedContent.map((q: any) => ({
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
            })),
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}
