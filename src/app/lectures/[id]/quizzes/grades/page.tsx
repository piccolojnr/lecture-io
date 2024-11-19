import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface GradesPageProps {
  params: Promise<{ id: string }>;
}

export default async function GradesPage({ params }: GradesPageProps) {
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
          attempts: {
            where: {
              userId: session.user.id,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{lecture.title} - Quiz Grades</h1>
          <Link
            href={`/lectures/${lecture.id}/quizzes`}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-6">
          {lecture.Quiz.map((quiz) => {
            const attempts = quiz.attempts || [];
            const totalAttempts = attempts.length;
            const totalQuestions = quiz.questions.length;

            if (totalAttempts === 0) return null;

            const bestScore = Math.max(...attempts.map((a) => a.score));
            const averageScore =
              attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts;
            const bestPercentage = (bestScore / totalQuestions) * 100;
            const averagePercentage = (averageScore / totalQuestions) * 100;

            return (
              <div
                key={quiz.id}
                className="border-b border-gray-200 last:border-0 pb-6"
              >
                <h3 className="text-xl font-bold mb-4">{quiz.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Overall Performance
                    </h4>
                    <div className="space-y-2">
                      <p>
                        Best Score:{" "}
                        <span className="font-medium">
                          {bestScore}/{totalQuestions} (
                          {bestPercentage.toFixed(1)}
                          %)
                        </span>
                      </p>
                      <p>
                        Average Score:{" "}
                        <span className="font-medium">
                          {averageScore.toFixed(1)}/{totalQuestions} (
                          {averagePercentage.toFixed(1)}%)
                        </span>
                      </p>
                      <p>
                        Total Attempts:{" "}
                        <span className="font-medium">{totalAttempts}</span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Recent Attempts
                    </h4>
                    <div className="space-y-2">
                      {attempts.slice(0, 3).map((attempt) => {
                        const percentage =
                          (attempt.score / totalQuestions) * 100;
                        return (
                          <div
                            key={attempt.id}
                            className="flex justify-between items-center"
                          >
                            <span className="text-gray-600">
                              {new Date(attempt.createdAt).toLocaleDateString()}
                            </span>
                            <span
                              className={`font-medium ${
                                percentage >= 70
                                  ? "text-green-600"
                                  : percentage >= 50
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {attempt.score}/{totalQuestions} (
                              {percentage.toFixed(1)}
                              %)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {lecture.Quiz.every((quiz) => !quiz.attempts?.length) && (
            <div className="text-center py-8">
              <p className="text-gray-500">No quiz attempts yet.</p>
              <Link
                href={`/lectures/${lecture.id}/quizzes`}
                className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
              >
                Take a Quiz
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
