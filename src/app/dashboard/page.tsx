import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DocumentProcessor } from "@/components/DocumentProcessor";

export default async function Dashboard() {
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
          Quizzes: true,
          flashcardSets: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid gap-6">
            {/* Welcome Section */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg divide-y divide-gray-200">
              <div className="px-4 py-5 sm:px-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Welcome back, {session.user.name}!
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Upload your lecture notes to get started
                </p>
              </div>
              <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    Document Processing
                  </h2>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <DocumentProcessor />
                </div>
              </div>
            </div>

            {/* Lectures Section */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Your Lectures
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Manage and review your lecture notes
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                {lectures.length === 0 ? (
                  <p className="text-center text-gray-500">
                    No lectures yet. Upload your first lecture notes to get
                    started!
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {lectures.map((lecture) => (
                      <Link
                        key={lecture.id}
                        href={`/lectures/${lecture.id}`}
                        className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50 transition-colors"
                      >
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {lecture.title}
                        </h3>
                        <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                          <span>
                            {lecture._count.flashcardSets} flashcard sets
                          </span>
                          <span>•</span>
                          <span>{lecture._count.Quizzes} quizzes</span>
                        </div>
                        <time className="mt-2 block text-sm text-gray-500">
                          {new Date(lecture.createdAt).toLocaleDateString()}
                        </time>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Document Processing */}
          </div>
        </div>
      </div>
    </div>
  );
}
