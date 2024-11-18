import { Lecture } from "@/types";
import axios from "axios";
import { useState } from "react";

export default function CreateQuizzesModal({
  lectures,
  setLectures,
  fetchLectures,
  quizzes,
}: {
  lectures: Lecture[];
  quizzes: any[] | null;
  setLectures: (lectures: Lecture[]) => void;
  fetchLectures: () => void;
}) {
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [selectedLectureId, setSelectedLectureId] = useState("");
  const [loadingLectures, setLoadingLectures] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateLecture = async () => {
    setError(null);
    if (!newLectureTitle) {
      setError("Please enter a lecture title.");
      return;
    }

    setLoadingLectures(true);

    try {
      const response = await axios.post("/api/lectures", {
        title: newLectureTitle,
      });
      setLectures([...lectures, response.data]);
      setNewLectureTitle("");
      fetchLectures();
    } catch (error) {
      console.error("Error creating lecture:", error);
      setError("Error creating lecture.");
    } finally {
      setLoadingLectures(false);
    }
  };

  const handleAddQuizzesToLecture = async () => {
    setError(null);
    if (!selectedLectureId || !quizzes) {
      setError("Please select a lecture and upload quizzes.");
      return;
    }

    setLoadingQuizzes(true);

    try {
      const res = await axios.post(`/api/quizzes`, {
        quizzes,
        lectureId: selectedLectureId,
      });

      console.log(res.data);

      fetchLectures();
    } catch (error) {
      console.error("Error adding quizzes to lecture:", error);
      alert("Error adding quizzes to lecture.");
      setError("Error adding quizzes to lecture.");
    } finally {
      setLoadingQuizzes(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Create Lecture</h2>
      <input
        type="text"
        value={newLectureTitle}
        onChange={(e) => setNewLectureTitle(e.target.value)}
        placeholder="Lecture Title"
        className="block w-full text-sm text-gray-500 py-2 px-4 rounded border"
      />
      <button
        onClick={handleCreateLecture}
        className={`text-primary hover:text-primary/90 py-2 text-sm font-semibold
                ${
                  !newLectureTitle || loadingLectures
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
    
                `}
        disabled={!newLectureTitle || loadingLectures}
      >
        {loadingLectures ? "Creating Lecture..." : "Create Lecture"}
      </button>

      <h2 className="text-2xl font-semibold mb-4">
        Add Quizzes to Existing Lecture
      </h2>
      <select
        value={selectedLectureId}
        onChange={(e) => setSelectedLectureId(e.target.value)}
        className="block w-full text-sm text-gray-500 py-2 px-4 rounded border"
      >
        <option value="">Select Lecture</option>
        {lectures.map((lecture) => (
          <option key={lecture.id} value={lecture.id}>
            {lecture.title}
          </option>
        ))}
      </select>
      <button
        onClick={handleAddQuizzesToLecture}
        className={`text-primary hover:text-primary/90 py-2 text-sm font-semibold ${
          !selectedLectureId || !quizzes || loadingQuizzes
            ? "opacity-50 cursor-not-allowed"
            : ""
        }
                `}
        disabled={!selectedLectureId || !quizzes || loadingQuizzes}
      >
        {loadingQuizzes ? "Adding Quizzes..." : "Add Quizzes"}
      </button>

      {error && (
        <div className="bg-red-100 p-4 rounded-lg shadow-md text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
