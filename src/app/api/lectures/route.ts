import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const lectures = await prisma.lecture.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(lectures);
    } catch (error) {
        console.error("Failed to fetch lectures:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { title, description } = await req.json();

        if (!title) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        if (title.length > 100) {
            return new NextResponse("Title too long", { status: 400 });
        }

        if (description && description.length > 500) {
            return new NextResponse("Description too long", { status: 400 });
        }

        const existingLecture = await prisma.lecture.findFirst({
            where: {
                title,
                userId: session.user.id,
            },
        });

        if (existingLecture) {
            return new NextResponse("Lecture with this title already exists", { status: 400 });
        }

        const lecture = await prisma.lecture.create({
            data: {
                title,
                description,
                userId: session.user.id,
            },
        });

        return NextResponse.json(lecture);
    } catch (error) {
        console.error("Failed to create lecture:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}