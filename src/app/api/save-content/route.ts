import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateContent } from '@/lib/content-validator';
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from 'next-auth';




export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { content, type, lectureId, title, description, newLecture } = await req.json();

    console.log("Saving content of type", type);

    if (!content || !type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!lectureId && !newLecture) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!lectureId && newLecture) {
      if (!newLecture.title) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
    }



    // Validate content before saving
    const validationResult = validateContent(content, type);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: 'Invalid content', details: validationResult.errors },
        { status: 400 }
      );
    }


    const uniqueTopics
      = [...new Set(content.map((item: any) => item.topic))];
    const topics: Record<string, number> = {};
    let parsedLectureId;

    await prisma.$transaction(async (prisma) => {
      parsedLectureId = !newLecture && lectureId ? parseInt(lectureId, 10) : null;
      if (newLecture) {
        const newLectureId = await prisma.lecture.upsert({
          where: {
            userId_title: {
              userId: session.user.id,
              title: newLecture.title
            }
          },
          create: {
            title: newLecture.title,
            description: newLecture.description,
            userId: session.user.id
          },
          update: {
          }
        });

        parsedLectureId = newLectureId.id;
      }

      if (!parsedLectureId) {
        return NextResponse.json(
          { error: 'Invalid lectureId' },
          { status: 400 }
        );
      }



      for (const topic of uniqueTopics) {
        const title = topic as string;
        const lectureId = parsedLectureId;

        const existingTopic = await prisma.topic.findFirst({
          where: { title, lectureId },
        });

        if (existingTopic) {
          return existingTopic.id;
        }

        const newTopic = await prisma.topic.create({
          data: { title, lectureId },
        });

        topics[title] = newTopic.id;
      }


      if (type === 'quiz') {
        const existingQuiz = await prisma.quiz.findFirst({
          where: { title, lectureId: parsedLectureId },
        });

        if (existingQuiz) {
          return NextResponse.json(
            { error: 'Quiz with the same title already exists' },
            { status: 400 }
          );
        }


        await prisma.quiz.create({
          data: {
            title, description,
            lectureId: parsedLectureId,
            questions: {
              create: content.map((question: any) => ({
                question: question.question,
                explanation: question.explanation || null,
                options: {
                  create: question.options.map((option: any) => ({
                    value: option,
                    correct: option === question.correctAnswer,
                  })),
                },
                topicId: topics[question.topic],
              })
              )
            }
          },
        });

      } else if (type === 'flashcard') {
        const existingSet = await prisma.flashcardSet.findFirst({
          where: { title, lectureId: parsedLectureId },
        });

        if (existingSet) {
          return NextResponse.json(
            { error: 'Flashcard set with the same title already exists' },
            { status: 400 }
          );
        }

        await prisma.flashcardSet.create({
          data: {
            title,
            description,
            lectureId: parsedLectureId,
            flashcards: {
              create: content.map((card: any) => ({
                question: card.question,
                answer: card.answer,
                additionalNotes: card.additionalNotes || null,
                topicId: topics[card.topic],
                confidence: 0,
                lastReviewed: null,
                nextReview: null,
              })),
            },
          },
        });
      } else {
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
      }

    });

    return NextResponse.json({ success: true, lectureId: parsedLectureId });
  } catch (error: any) {
    console.error('Error saving content:', error.message);
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    );
  }
}
