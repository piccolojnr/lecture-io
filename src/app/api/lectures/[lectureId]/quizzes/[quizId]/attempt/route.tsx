import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  data: { params: Promise<{ lectureId: string; quizId: string }> }
) {
  const params = await data.params;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const lectureId = parseInt(params.lectureId, 10);
    const quizId = parseInt(params.quizId, 10);

    if (isNaN(lectureId) || isNaN(quizId)) {
      return new NextResponse("Invalid lecture or quiz ID", { status: 400 });
    }

    // Verify the lecture exists and belongs to the user
    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
    });

    if (!lecture) {
      return new NextResponse("Lecture not found", { status: 404 });
    }

    if (lecture.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Parse and validate the request body
    const body = await request.json();
    const { answers, score } = body;

    console.log("Creating quiz attempt with answers:", answers);

    if (!Array.isArray(answers) || answers.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: "Answers must be a non-empty array" }),
        { status: 400 }
      );
    }

    if (score === undefined || score === null) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required field: score" }),
        { status: 400 }
      );
    }

    const parsedScore = parseInt(score, 10);
    if (isNaN(parsedScore)) {
      return new NextResponse(JSON.stringify({ error: "Invalid score" }), {
        status: 400,
      });
    }

    // Create the quiz attempt and associated answers
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId: session.user.id,
        score: parsedScore,
        answers: {
          create: answers.map(
            (answer: { questionId: number; answerId: number }) => {
              const { questionId, answerId } = answer;

              if (!questionId || isNaN(questionId)) {
                throw new Error("Invalid or missing questionId in answers");
              }

              if (
                answerId === undefined ||
                answerId === null ||
                isNaN(answerId)
              ) {
                throw new Error(
                  "Invalid or missing selected option in answers"
                );
              }

              return {
                answerId,
                questionId,
              };
            }
          ),
        },
      },
      include: {
        answers: true, // Include associated answers in the response
      },
    });

    return NextResponse.json(quizAttempt);
  } catch (error: any) {
    console.error("Error creating quiz attempt:", error.message);

    if (
      error instanceof Error &&
      error.message.includes("Invalid or missing")
    ) {
      return new NextResponse(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
