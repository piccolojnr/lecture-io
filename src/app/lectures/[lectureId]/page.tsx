import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface LectureParams {
  params: { lectureId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

async function fetchLectureData(lectureId: number, userId: string) {
  try {
    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
      include: {
        flashcardSets: { include: { flashcards: true } },
        Quizzes: { include: { questions: true } },
      },
    });

    if (!lecture) {
      notFound();
    }

    if (lecture.userId !== userId) {
      redirect("/dashboard");
    }

    return lecture;
  } catch (error) {
    console.error("Error fetching lecture data:", error);
    notFound();
  }
}

export default async function LecturePage({ params }: LectureParams) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const { lectureId } = await params;
  const lectureIdParsed = parseInt(lectureId, 10);

  if (isNaN(lectureIdParsed)) {
    console.log("Invalid Lecture ID");
    notFound();
  }

  const lecture = await fetchLectureData(lectureIdParsed, session.user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{lecture.title}</h1>
        {lecture.description && (
          <p className="text-gray-600 mt-2">{lecture.description}</p>
        )}
      </header>

      {/* Quiz Section */}
      <section className="mb-8 bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Quiz</h2>
        </div>
        <div className="space-y-4">
          {lecture.Quizzes.length > 0 ? (
            lecture.Quizzes.map((quiz) => (
              <Link
                href={`/lectures/${lecture.id}/quizzes/${quiz.id}`}
                key={quiz.id}
                className="block p-4 bg-gray-100 rounded-lg shadow hover:bg-gray-200 transition-colors"
              >
                <h3 className="text-lg font-bold">{quiz.title}</h3>
                <p className="text-sm text-gray-600">
                  {quiz.questions.length} questions
                </p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-600">No quizzes available.</p>
          )}
        </div>
      </section>

      {/* Flashcard Sets Section */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {lecture.flashcardSets.length} Flashcard Sets
          </h2>
        </div>
        <div className="space-y-4">
          {lecture.flashcardSets.length > 0 ? (
            lecture.flashcardSets.map((flashcardSet) => (
              <Link
                href={`/lectures/${lecture.id}/flashcards/${flashcardSet.id}`}
                key={flashcardSet.id}
                className="block p-4 bg-gray-100 rounded-lg shadow hover:bg-gray-200 transition-colors"
              >
                <h3 className="text-lg font-bold">{flashcardSet.title}</h3>
                <p className="text-sm text-gray-600">
                  {flashcardSet.flashcards.length} flashcards
                </p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-600">
              No flashcard sets available.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
