import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatSessions = await prisma.aIAssistantChat.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(chatSessions);
  } catch (error) {
    console.error("Failed to fetch chat sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lectureId } = await req.json();

    if (!lectureId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const lectureIdParsed = parseInt(lectureId, 10);
    if (isNaN(lectureIdParsed)) {
      return new NextResponse("Invalid lecture ID", { status: 400 });
    }

    const chatSession = await prisma.aIAssistantChat.create({
      data: {
        messages: [],
        lectureId: lectureIdParsed,
        userId: session.user.id,
      },
    });

    return NextResponse.json(chatSession);
  } catch (error) {
    console.error("Failed to create chat session:", error);
    return NextResponse.json(
      { error: "Failed to create chat session" },
      { status: 500 }
    );
  }
}
