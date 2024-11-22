import { prisma } from "@/lib/prisma";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { title, description, lectureId } = await req.json();

  if (!title || !lectureId) {
    return new NextResponse(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400 }
    );
  }

  try {
    const topic = await prisma.topic.create({
      data: {
        title,
        description,
        lectureId,
      },
    });

    return new NextResponse(JSON.stringify(topic), { status: 200 });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function GET(req: Request) {
  const lectureId = new URLSearchParams(req.url).get("lectureId");

  let where = {};
  if (lectureId) {
    where = {
      lectureId: Number(lectureId),
    };
  }

  const topics = await prisma.topic.findMany({
    where,
  });

  return new Response(JSON.stringify(topics), { status: 200 });
}
