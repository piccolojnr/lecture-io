import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Update a flashcard
export async function PUT(
  req: Request,
  { params }: { params: { lectureId: string; flashcardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { question, answer, additionalNotes, confidence } = await req.json();

    // Get flashcard and verify ownership
    const flashcard = await prisma.flashcard.findUnique({
      where: { id: parseInt(params.flashcardId) },
      include: {
        Lecture: true,
      },
    });

    if (!flashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    if (flashcard.Lecture.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update flashcard
    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: parseInt(params.flashcardId) },
      data: {
        question,
        answer,
        additionalNotes,
        confidence,
        lastReviewed: confidence !== undefined ? new Date() : undefined,
      },
    });

    return NextResponse.json(updatedFlashcard);
  } catch (error) {
    console.error('Error updating flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to update flashcard' },
      { status: 500 }
    );
  }
}

// Delete a flashcard
export async function DELETE(
  req: Request,
  { params }: { params: { lectureId: string; flashcardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get flashcard and verify ownership
    const flashcard = await prisma.flashcard.findUnique({
      where: { id: parseInt(params.flashcardId) },
      include: {
        Lecture: true,
      },
    });

    if (!flashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    if (flashcard.Lecture.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete flashcard
    await prisma.flashcard.delete({
      where: { id: parseInt(params.flashcardId) },
    });

    return NextResponse.json({ message: 'Flashcard deleted successfully' });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to delete flashcard' },
      { status: 500 }
    );
  }
}
