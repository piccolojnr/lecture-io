import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }


  try {
    const { lectureId, type, duration } = await request.json();

    if (!lectureId || !type || !duration) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const lectureIdParsed = parseInt(lectureId, 10);
    if (isNaN(lectureIdParsed)) {
      return new NextResponse("Invalid lecture ID", { status: 400 });
    }

    const parseDuration = parseInt(duration, 10);
    if (isNaN(parseDuration)) {
      return new NextResponse("Invalid duration", { status: 400 });
    }


    const studySession = await prisma.studySession.upsert({
      where: {
        userId_lectureId_type: {
          userId: session.user.id,
          lectureId: lectureIdParsed,
          type,
        },
      },
      update: {
        type,
        duration: parseDuration,
      },
      create: {
        userId: session.user.id,
        lectureId: lectureIdParsed,
        type,
        duration: parseDuration,
      },
    });



    return NextResponse.json({ studySession });
  } catch (error) {
    console.error("Failed to create study session:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const studySessions = await prisma.studySession.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        lecture: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(studySessions);
  } catch (error) {
    console.error("Failed to fetch study sessions:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
