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
            include: {
                _count: {
                    select: {
                        flashcards: true,
                        Quiz: true,
                    },
                },
            },
        });

        return NextResponse.json(lectures);
    } catch (error) {
        console.error("Failed to fetch lectures:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
