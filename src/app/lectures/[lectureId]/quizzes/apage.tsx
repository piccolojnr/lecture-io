import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import QuizManager from "@/components/QuizManager";
import QuizList from "@/components/QuizList";
import Link from "next/link";

interface QuizPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }
  const { id } = await params;

  const lectureId = parseInt(id, 10);
  if (isNaN(lectureId)) {
    notFound();
  }

  const lecture = await prisma.lecture.findUnique({
    where: {
      id: lectureId,
    },
    include: {
      Quiz: {
        include: {
          questions: true,
          options: true,
          Topic: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      flashcards: {
        include: {
          Topic: true,
        },
        take: 1,
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{lecture.title} - Quizzes</h1>
          <Link
            href={`/lectures/${lecture.id}`}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Back to Lecture
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Create Quiz</h2>
          <QuizManager
            lectureId={lecture.id}
            topicId={lecture.flashcards[0]?.Topic?.id || 1}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Available Quizzes</h2>
            <Link
              href={`/lectures/${lecture.id}/quizzes/grades`}
              className="text-indigo-600 hover:text-indigo-800"
            >
              View Grades
            </Link>
          </div>
          <QuizList quizzes={lecture.Quiz} lectureId={lecture.id} />
        </div>
      </div>
    </div>
  );
}
