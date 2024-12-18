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

    const notes = await prisma.note.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
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

    const body = await req.json();
    const { title, content, lectureId } = body;

    console.log("Body:", body);

    if (!title || !content || !lectureId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const parsedLectureId = parseInt(lectureId, 10);
    if (isNaN(parsedLectureId)) {
      return NextResponse.json(
        { error: "Invalid lecture ID" },
        { status: 400 }
      );
    }


    // existing note title check
    const existingNote = await prisma.note.findFirst({
      where: {
        title,
        userId: session.user.id,
      },
    });

    if (existingNote) {
      return NextResponse.json(
        { error: "Note with this title already exists" },
        { status: 400 }
      );
    }


    const note = await prisma.note.create({
      data: {
        title,
        content,
        lectureId: parsedLectureId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(note);
  } catch (error: any) {
    console.error("Failed to create note:", error.message);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, content } = await req.json();

    if (!id || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }



    const note = await prisma.note.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        title,
        content,
      },
    });

    return NextResponse.json(note);
  } catch (error: any) {
    console.error("Failed to update note:", error.message);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}
