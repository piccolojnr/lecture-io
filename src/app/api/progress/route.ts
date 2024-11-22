import { NextResponse } from "next/server";
import { authOptions } from "@/utils/authOptions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    console.error("Invalid JSON body:", err);
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  const { lectureId, type, data } = body;

  if (!lectureId || !type || !data) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  const lectureIdParsed = parseInt(lectureId, 10);
  if (isNaN(lectureIdParsed)) {
    return new NextResponse("Invalid lecture ID", { status: 400 });
  }

  try {
    const progress = await prisma.studyProgress.upsert({
      where: {
        userId_lectureId: {
          userId: session.user.id,
          lectureId: lectureIdParsed,
        },
      },
      update: {
        ...(type === "quiz" && { quizScores: data }),
        ...(type === "flashcard" && { flashcardIds: data }),
        lastStudied: new Date(),
      },
      create: {
        userId: session.user.id,
        lectureId: lectureIdParsed,
        flashcardIds: type === "flashcard" ? data : "[]",
        quizScores: type === "quiz" ? data : "{}",
        lastStudied: new Date(),
      },
    });


    return NextResponse.json({ success: true, progress, });
  } catch (error) {
    console.error("Failed to update progress:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const lectureId = url.searchParams.get("lectureId");

  if (!lectureId || isNaN(parseInt(lectureId, 10))) {
    return new NextResponse("Lecture ID is required and must be a valid number", { status: 400 });
  }

  try {
    const progress = await prisma.studyProgress.findUnique({
      where: {
        userId_lectureId: {
          userId: session.user.id,
          lectureId: parseInt(lectureId, 10),
        },
      },
    });

    return NextResponse.json(progress || { flashcardIds: "[]", quizScores: "{}" });
  } catch (error) {
    console.error("Failed to fetch progress:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
