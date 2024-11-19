import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import PieChartPlot from "@/components/charts/PieChartPlot";
import {
  FlashcardMasteryBarChartPlot,
  QuizAverageScoreBarChartPlot,
  QuizScoreBarChartPlot,
} from "@/components/charts/BarChartPlot";
import moment from "moment";

export default async function ProgressDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Fetch user's study data
  const studySessions = await prisma.studySession.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      lecture: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const progress = await prisma.studyProgress.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      lecture: true,
    },
  });

  // Calculate study time per type
  const studyTimeByType = studySessions.reduce((acc, session) => {
    acc[session.type] = (acc[session.type] || 0) + session.duration;
    return acc;
  }, {} as Record<string, number>);

  const studyTimeData = Object.entries(studyTimeByType).map(
    ([name, value]) => ({
      name,
      value: value,
    })
  );

  // Calculate average quiz scores
  const quizScores = progress.flatMap((p) => {
    const scores = JSON.parse(p.quizScores as string);
    return Object.entries(scores).map(([date, score]) => ({
      date,
      score: Math.round(score as number),
      lecture: p.lecture.title,
    }));
  });

  const averageScores = quizScores.reduce((acc, score) => {
    acc[score.lecture] = (acc[score.lecture] || []).concat(score.score);
    return acc;
  }, {} as Record<string, number[]>);

  const averageScoreData = Object.entries(averageScores).map(
    ([name, scores]) => ({
      name,
      value: scores.reduce((a, b) => a + b, 0) / scores.length,
    })
  );

  // Calculate flashcard mastery
  const flashcardMastery = progress.map((p) => {
    console.log("Flashcard Mastery", JSON.parse(p.flashcardIds as string));
    const flashcardIds = JSON.parse(p.flashcardIds as string);
    const mastered = flashcardIds.filter((id: number) => id !== null).length;
    return {
      lecture: p.lecture.title,
      mastered: mastered,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Study Progress Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Study Time Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Study Time Distribution
          </h2>
          <div className="h-64">
            {studyTimeData.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-center text-gray-500">No study sessions</p>
              </div>
            ) : (
              <PieChartPlot data={studyTimeData} />
            )}
          </div>
        </div>

        {/* Quiz Performance */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quiz Performance</h2>
          <div className="h-64">
            {quizScores.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-center text-gray-500">No quizzes taken</p>
              </div>
            ) : (
              <QuizScoreBarChartPlot data={quizScores} />
            )}
          </div>
        </div>

        {/* Average Quiz Scores */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Average Quiz Scores</h2>
          <div className="h-64">
            {averageScoreData.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-center text-gray-500">No quizzes taken</p>
              </div>
            ) : (
              <QuizAverageScoreBarChartPlot data={averageScoreData} />
            )}
          </div>
        </div>

        {/* Flashcard Mastery */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Flashcard Mastery</h2>
          <div className="h-64">
            {flashcardMastery.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-center text-gray-500">
                  No flashcards studied
                </p>
              </div>
            ) : (
              <FlashcardMasteryBarChartPlot data={flashcardMastery} />
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {studySessions.length === 0 ? (
              <div
                className="flex items-center justify-center h-64"
                style={{ height: "16rem" }}
              >
                <p className="text-gray-500">No recent study sessions</p>
              </div>
            ) : (
              studySessions.slice(0, 5).map((session) => (
                <div
                  key={`${session.userId}-${session.lectureId}-${session.type}`}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{session.lecture.title}</p>
                    <p className="text-sm text-gray-600">
                      {session.type} -{" "}
                      {session.duration > 60
                        ? moment
                            .duration(session.duration, "seconds")
                            .asMinutes()
                        : moment
                            .duration(session.duration, "seconds")
                            .asSeconds()}{" "}
                      {session.duration > 60 ? "minutes" : "seconds"}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {moment(session.createdAt).subtract(1, "day").fromNow()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
