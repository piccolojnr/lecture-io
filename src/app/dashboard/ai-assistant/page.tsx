import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import AIAssistantContainer from "@/components/AIAssistantContainer";
import ErrorDisplay from "@/components/ErrorDisplay";

export default async function AIAssistantPage() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      redirect("/auth/signin");
    }

    const lectures = await prisma.lecture.findMany({
      where: {
        userId: session.user.id as string,
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

    if (!lectures || lectures.length === 0) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorDisplay message="No lectures found. Please create a lecture first to use the AI Study Assistant." />
        </div>
      );
    }

    return <AIAssistantContainer lectures={lectures as any} />;
  } catch (error) {
    console.error("Error fetching lectures:", error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorDisplay message="Failed to load lectures. Please try refreshing the page." />
      </div>
    );
  }
}
