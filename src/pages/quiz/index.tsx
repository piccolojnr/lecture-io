import CreateQuizzesModal from "@/components/CreateQuizzesModal";
import Layout from "@/components/Layout";
import { parseQuizzesJsonFile } from "@/services/parseJson";
import { Lecture } from "@/types";
import axios from "axios";
import { useState, useCallback, useEffect } from "react";

const QuizSection = () => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [quizzes, setQuizzes] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/json") {
      setError("Please upload a valid JSON file.");
      return;
    }

    try {
      const parsedQuizzes = await parseQuizzesJsonFile(file);
      setQuizzes(parsedQuizzes);
      setError(null);
    } catch (err) {
      console.error("Error parsing JSON file:", err);
      setError("Failed to parse the JSON file. Please check its format.");

      // Clear the file input
      e.target.value = "";
    }
  };
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Quiz</h1>

        {error && (
          <div className="bg-red-100 p-4 rounded-lg shadow-md text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md flex items-start justify-between flex-col gap-4">
          <h2 className="text-2xl font-semibold mb-4">Upload Quizzes</h2>

          <input
            type="file"
            accept="application/json"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <CreateQuizzesModal
            lectures={lectures}
            setLectures={setLectures}
            quizzes={quizzes}
            fetchLectures={fetchLectures}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Create Quiz</h2>
          <select className="block w-full text-sm text-gray-500 py-2 px-4 rounded border">
            <option value="">Select Lecture</option>
            {lectures.map((lecture) => (
              <option key={lecture.id} value={lecture.id}>
                {lecture.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Question"
            className="block w-full text-sm text-gray-500 py-2 px-4 rounded border mt-4"
          />
          <input
            type="text"
            placeholder="Correct Answer"
            className="block w-full text-sm text-gray-500 py-2 px-4 rounded border mt-4"
          />
          <input
            type="text"
            placeholder="Explanation"
            className="block w-full text-sm text-gray-500 py-2 px-4 rounded border mt-4"
          />
          <button className="text-primary hover:text-primary/90 py-2 text-sm font-semibold mt-4">
            Create Quiz
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default QuizSection;
