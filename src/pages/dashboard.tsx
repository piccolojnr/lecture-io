import Layout from "@/components/Layout";
import { Lecture } from "@/types";
import axios from "axios";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function Dashboard() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const fetchLectures = useCallback(async () => {
    try {
      const response = await axios.get("/api/lectures");
      setLectures(response.data);
    } catch (error) {
      console.error("Error fetching lectures:", error);
    }
  }, []);
  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Study Dashboard</h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Lectures</h2>
          {lectures.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">ID</th>
                    <th className="py-2 px-4 border-b">Lecture Title</th>
                    <th className="py-2 px-4 border-b">Number of Flashcards</th>
                    <th className="py-2 px-4 border-b">Number of Topics</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lectures.map((lecture) => (
                    <tr key={lecture.id}>
                      <td className="py-2 px-4 border-b text-center">
                        {lecture.id}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {lecture.title}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {lecture.flashcardsCount}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {lecture.topicsCount}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        <Link
                          href={`/flashcards/${lecture.id}`}
                          className="text-primary hover:text-primary/90"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No lectures available.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
