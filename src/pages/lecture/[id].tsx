/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import GenerateFlashcardsButton from "@/components/GenerateFlashcardsButton";
import { Lecture } from "@/types";

const LecturePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLecture = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/lectures/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch lecture");
        }
        const data = await response.json();
        setLecture(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching lecture:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLecture();
  }, [id]);

  const handleFlashcardsGenerated = () => {
    // Optionally show a success message or redirect to flashcards page
    router.push("/flashcards");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error || !lecture) {
    return (
      <Layout>
        <div className="text-center text-red-500">
          {error || "Lecture not found"}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-900">{lecture.title}</h1>
          <GenerateFlashcardsButton
            lecture={lecture}
            onSuccess={handleFlashcardsGenerated}
          />
        </div>

        {/* Lecture Content */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Topics</h2>
          <div className="space-y-4">
            {lecture.topics.map((topic) => (
              <div key={topic.id} className="border-b pb-4">
                <h3 className="font-medium text-lg text-gray-800">
                  {topic.title}
                </h3>
                <ul className="mt-2 space-y-2">
                  {topic.keyPoints.map((point, index) => (
                    <li key={index} className="text-gray-600">
                      • {point.content}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Slides */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Slides</h2>
          <div className="space-y-4">
            {lecture.slides.map((slide, index) => (
              <div key={index} className="border-b pb-4">
                <div className="prose max-w-none">
                  {slide.content.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LecturePage;
