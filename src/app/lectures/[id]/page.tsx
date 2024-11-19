import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import FlashcardManager from "@/components/FlashcardManager";
import Link from "next/link";

export default async function LecturePage({
  params,
}: {
  params: Promise<{ id: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  const lectureId = parseInt(id, 10);
  if (isNaN(lectureId)) {
    console.log("Lecture ID is not a number");
    notFound();
  }

  const lecture = await prisma.lecture.findUnique({
    where: {
      id: lectureId,
    },
    include: {
      flashcards: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          Topic: true,
        },
      },
      Quiz: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!lecture) {
    notFound();
  }

  // Check if the lecture belongs to the current user
  if (lecture.userId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{lecture.title}</h1>
      </div>

      <div>
        {/* <div>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Study Mode</h2>
            <SpacedRepetitionStudy
              lectureId={lecture.id}
              initialFlashcards={lecture.flashcards}
            />
          </div>
        </div> */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Study Tools</h2>
            </div>
            <div className="space-y-4">
              <Link
                href={`/lectures/${lecture.id}/quizzes`}
                className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">Quizzes</h3>
                <p className="text-gray-600">
                  Test your knowledge with interactive quizzes
                </p>
              </Link>
              <div className="p-6 bg-white rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Flashcards</h3>
                <FlashcardManager
                  lectureId={lecture.id}
                  initialFlashcards={lecture.flashcards}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
