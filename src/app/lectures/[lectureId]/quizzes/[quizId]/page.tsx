import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import BackButton from "@/components/BackButton";
import QuizList from "@/components/QuizList";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
interface QuizParams {
  params: { quizId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

async function fetchQuizData(quizId: number, userId: string) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: { options: true, Topic: true },
        },
        Lecture: true,
        flashcardSet: true,
      },
    });

    if (!quiz) {
      notFound();
    }

    if (quiz.Lecture.userId !== userId) {
      redirect("/dashboard");
    }

    return quiz;
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    notFound();
  }
}

export default async function QuizPage({ params }: QuizParams) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const { quizId } = await params;
  const quizIdParsed = parseInt(quizId, 10);

  if (isNaN(quizIdParsed)) {
    console.log("Invalid Quiz ID");
    notFound();
  }

  const quiz = await fetchQuizData(quizIdParsed, session.user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <BackButton label="Back to Lecture" />
        <h1 className="text-3xl font-bold">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-gray-600 mt-2">{quiz.description}</p>
        )}
        <Link
          href={`/lectures/${quiz.lectureId}/quizzes/${quizId}/grades`}
          className="text-indigo-600 hover:text-indigo-800"
        >
          View Grades
        </Link>
      </header>

      {/* Quiz Section */}
      <div>
        <QuizList quiz={quiz as any} />
      </div>
    </div>
  );
}
