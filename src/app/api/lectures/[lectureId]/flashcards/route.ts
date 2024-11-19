import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Create a new flashcard
export async function POST(
  req: Request,
  { params }: { params: { lectureId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { question, answer, additionalNotes } = await req.json();

    // Validate input
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    // Get lecture and verify ownership
    const lecture = await prisma.lecture.findUnique({
      where: { id: parseInt(params.lectureId) },
    });

    if (!lecture) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
    }

    if (lecture.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create flashcard
    const flashcard = await prisma.flashcard.create({
      data: {
        question,
        answer,
        additionalNotes,
        lectureId: parseInt(params.lectureId),
        topicId: lecture.topicId,
      },
    });

    return NextResponse.json(flashcard);
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to create flashcard' },
      { status: 500 }
    );
  }
}

// Get all flashcards for a lecture
export async function GET(
  req: Request,
  { params }: { params: { lectureId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get lecture and verify ownership
    const lecture = await prisma.lecture.findUnique({
      where: { id: parseInt(params.lectureId) },
      include: {
        flashcards: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!lecture) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
    }

    if (lecture.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(lecture.flashcards);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcards' },
      { status: 500 }
    );
  }
}
