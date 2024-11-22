import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface GradesPageProps {
  params: Promise<{ quizId: string }>;
}

export default async function GradesPage({ params }: GradesPageProps) {
  const session = await getServerSession(authOptions);

  // Redirect to sign-in if no session
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const { quizId: id } = await params;
  const quizId = parseInt(id, 10);

  // Handle invalid quiz ID
  if (isNaN(quizId)) {
    notFound();
  }

  // Fetch quiz data with related details
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: {
          options: true,
          Topic: true,
        },
      },
      Lecture: true,
      flashcardSet: true,
      attempts: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // If quiz not found
  if (!quiz) {
    notFound();
  }

  // Check if the quiz belongs to the current user
  if (quiz.Lecture.userId !== session.user.id) {
    redirect("/dashboard");
  }

  const attempts = quiz.attempts || [];
  const totalAttempts = attempts.length;
  const totalQuestions = quiz.questions.length;

  // Calculate performance stats
  const bestScore =
    attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : 0;
  const averageScore =
    attempts.length > 0
      ? attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts
      : 0;

  const bestPercentage = (bestScore / totalQuestions) * 100 || 0;
  const averagePercentage = (averageScore / totalQuestions) * 100 || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{quiz.title} - Quiz Grades</h1>
          <Link
            href={`/lectures/${quiz.lectureId}/quizzes/${quizId}`}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-6">
          {/* Performance Summary */}
          <div className="border-b border-gray-200 last:border-0 pb-6">
            <h3 className="text-xl font-bold mb-4">Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Overall Performance
                </h4>
                <div className="space-y-2">
                  <p>
                    Best Score:{" "}
                    <span className="font-medium">
                      {bestScore}/{totalQuestions} ({bestPercentage.toFixed(1)}
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
                  {totalAttempts > 0 ? (
                    attempts.slice(0, 3).map((attempt) => {
                      const percentage = (attempt.score / totalQuestions) * 100;
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
                    })
                  ) : (
                    <p className="text-gray-500">No attempts yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* No Attempts Fallback */}
          {totalAttempts === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No quiz attempts yet.</p>
              <Link
                href={`/lectures/${quiz.lectureId}/quizzes/${quizId}`}
                className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
              >
                Take the Quiz
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
