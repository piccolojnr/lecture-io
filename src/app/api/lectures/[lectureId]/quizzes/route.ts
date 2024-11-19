import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { lectureId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const lectureId = parseInt(params.lectureId);
    if (isNaN(lectureId)) {
      return new NextResponse('Invalid lecture ID', { status: 400 });
    }

    // Check if the lecture belongs to the current user
    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
    });

    if (!lecture) {
      return new NextResponse('Lecture not found', { status: 404 });
    }

    // @ts-expect-error - userId not in type
    if (lecture.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { title, description, topicId, questions, options } = body;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        lectureId,
        topicId,
        questions: {
          create: questions,
        },
        options: {
          create: options,
        },
      },
      include: {
        questions: true,
        options: true,
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { lectureId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const lectureId = parseInt(params.lectureId);
    if (isNaN(lectureId)) {
      return new NextResponse('Invalid lecture ID', { status: 400 });
    }

    const quizzes = await prisma.quiz.findMany({
      where: { lectureId },
      include: {
        questions: true,
        options: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
