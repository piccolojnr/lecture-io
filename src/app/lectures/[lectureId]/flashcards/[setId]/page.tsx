import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import BackButton from "@/components/BackButton";
import FlashcardManager from "@/components/FlashcardManager";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

interface FlashcardParams {
  params: { setId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

async function fetchFlashcardData(flashcardId: number, userId: string) {
  try {
    const flashcard = await prisma.flashcardSet.findUnique({
      where: { id: flashcardId },
      include: {
        flashcards: true,
        Lecture: true,
        quizzes: { include: { questions: true } },
      },
    });

    if (!flashcard) {
      notFound();
    }

    if (flashcard.Lecture.userId !== userId) {
      redirect("/dashboard");
    }

    return flashcard;
  } catch (error) {
    console.error("Error fetching flashcard data:", error);
    notFound();
  }
}

export default async function FlashcardPage({ params }: FlashcardParams) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const { setId } = await params;
  const flashcardId = parseInt(setId, 10);

  if (isNaN(flashcardId)) {
    console.log("Invalid Flashcard ID");
    notFound();
  }

  const flashcard = await fetchFlashcardData(flashcardId, session.user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        {/* Back to Lecture */}
        <BackButton label="Back to Lecture" />

        <h1 className="text-3xl font-bold">{flashcard.title}</h1>
        {flashcard.description && (
          <p className="text-gray-600 mt-2">{flashcard.description}</p>
        )}
      </header>

      {/* Flashcards Section */}
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Flashcards</h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <FlashcardManager
            initialFlashcards={flashcard.flashcards}
            lectureId={flashcard.lectureId}
          />
        </div>
      </div>

      {/* Quiz Section */}
      <section className="mb-8 bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Quiz</h2>
        </div>
        <div className="grid gap-4">
          {flashcard.quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">{quiz.title}</h3>
              <p className="text-gray-600">{quiz.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
