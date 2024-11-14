import LectureUploader from "../components/LectureUploader";
import Link from "next/link";
import Layout from "@/components/Layout";
import { useLectures } from "@/contexts/LectureContext";
import { useEffect } from "react";

export default function Dashboard() {
  const { lectures, fetchLectures } = useLectures();

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Study Dashboard</h1>

        <LectureUploader />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lectures.data.map((lecture) => (
            <Link
              key={lecture.id}
              href={`/lecture/${lecture.id}`}
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {lecture.title}
              </h2>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${lecture.progress}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Progress: {lecture.progress}%
                </p>
              </div>
              <span
                className={`mt-4 inline-block px-3 py-1 rounded-full text-sm ${
                  lecture.status === "understood"
                    ? "bg-green-100 text-green-800"
                    : lecture.status === "review_needed"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {lecture.status.replace("_", " ")}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
