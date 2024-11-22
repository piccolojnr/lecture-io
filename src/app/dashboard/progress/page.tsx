import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/utils/authOptions";
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

  let studySessions = [];
  let progress = [];

  try {
    // Fetch user's study sessions
    studySessions = await prisma.studySession.findMany({
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

    // Fetch user's progress data
    progress = await prisma.studyProgress.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        lecture: true,
      },
    });
  } catch (error) {
    console.error("Error fetching study data:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Study Progress Dashboard</h1>
        <p className="text-red-500">
          Failed to load progress data. Please try again later.
        </p>
      </div>
    );
  }

  // Helper Functions
  const calculateStudyTimeData = () => {
    const studyTimeByType = studySessions.reduce((acc, session) => {
      acc[session.type] = (acc[session.type] || 0) + session.duration;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(studyTimeByType).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const calculateQuizScores = () => {
    return progress.flatMap((p) => {
      try {
        const scores = JSON.parse(
          typeof p.quizScores === "string" ? p.quizScores : "{}"
        );
        return Object.entries(scores).map(([date, score]) => ({
          date,
          score: Math.round(score as number),
          lecture: p.lecture.title,
        }));
      } catch (error) {
        console.error("Error parsing quizScores:", error);
        return [];
      }
    });
  };

  const calculateAverageScores = (quizScores: any[]) => {
    const averageScores = quizScores.reduce((acc, score) => {
      acc[score.lecture] = (acc[score.lecture] || []).concat(score.score);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(averageScores).map(([name, scores]) => ({
      name,
      value:
        (scores as number[]).reduce((a, b) => a + b, 0) /
        (scores as number[]).length,
    }));
  };

  const calculateFlashcardMastery = () => {
    return progress.map((p) => {
      try {
        const flashcardIds = JSON.parse(
          typeof p.flashcardIds === "string" ? p.flashcardIds : "[]"
        );
        const mastered = flashcardIds.filter(
          (id: number) => id !== null
        ).length;
        return {
          lecture: p.lecture.title,
          mastered,
        };
      } catch (error) {
        console.error("Error parsing flashcardIds:", error);
        return { lecture: p.lecture.title, mastered: 0 };
      }
    });
  };

  // Calculations
  const studyTimeData = calculateStudyTimeData();
  const quizScores = calculateQuizScores();
  const averageScoreData = calculateAverageScores(quizScores);
  const flashcardMastery = calculateFlashcardMastery();

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
              <div className="flex items-center justify-center h-64">
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
                        ? `${moment
                            .duration(session.duration, "seconds")
                            .asMinutes()} minutes`
                        : `${session.duration} seconds`}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {moment(session.createdAt).fromNow()}
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
