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

    const mindMaps = await prisma.mindMap.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(mindMaps);
  } catch (error) {
    console.error("Failed to fetch mind maps:", error);
    return NextResponse.json(
      { error: "Failed to fetch mind maps" },
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

    const { title, nodes, edges, lectureId } = await req.json();

    if (!title || !lectureId) {
      return NextResponse.json(
        { error: "Title and lecture ID are required" },
        { status: 400 }
      );
    }

    const mindMap = await prisma.mindMap.create({
      data: {
        title,
        nodes: JSON.stringify(nodes),
        edges: JSON.stringify(edges),
        lectureId: parseInt(lectureId),
        userId: session.user.id,
      },
    });

    return NextResponse.json(mindMap);
  } catch (error) {
    console.error("Failed to create mind map:", error);
    return NextResponse.json(
      { error: "Failed to create mind map" },
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

    const { id, nodes, edges } = await req.json();

    const mindMap = await prisma.mindMap.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        nodes,
        edges,
      },
    });

    return NextResponse.json(mindMap);
  } catch (error) {
    console.error("Failed to update mind map:", error);
    return NextResponse.json(
      { error: "Failed to update mind map" },
      { status: 500 }
    );
  }
}
