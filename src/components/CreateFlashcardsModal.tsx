import { Lecture } from "@/types";
import axios from "axios";
import { useState } from "react";

export default function CreateFlashcardsModal({
  lectures,
  setLectures,
  flashcards,
  fetchLectures,
}: {
  lectures: Lecture[];
  setLectures: (lectures: Lecture[]) => void;
  flashcards: any[] | null;
  fetchLectures: () => void;
}) {
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [selectedLectureId, setSelectedLectureId] = useState("");
  const [loadingLectures, setLoadingLectures] = useState(false);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
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

  const handleAddFlashcardsToLecture = async () => {
    setError(null);
    if (!selectedLectureId || !flashcards) {
      setError("Please select a lecture and upload flashcards.");
      return;
    }

    setLoadingFlashcards(true);

    try {
      const res = await axios.post(`/api/flashcards`, {
        flashcards,
        lectureId: selectedLectureId,
      });

      console.log(res.data);

      fetchLectures();
    } catch (error) {
      console.error("Error adding flashcards to lecture:", error);
      alert("Error adding flashcards to lecture.");
      setError("Error adding flashcards to lecture.");
    } finally {
      setLoadingFlashcards(false);
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
        Add Flashcards to Existing Lecture
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
        onClick={handleAddFlashcardsToLecture}
        className={`text-primary hover:text-primary/90 py-2 text-sm font-semibold ${
          !selectedLectureId || !flashcards || loadingFlashcards
            ? "opacity-50 cursor-not-allowed"
            : ""
        }
            `}
        disabled={!selectedLectureId || !flashcards || loadingFlashcards}
      >
        {loadingFlashcards ? "Adding Flashcards..." : "Add Flashcards"}
      </button>

      {error && (
        <div className="bg-red-100 p-4 rounded-lg shadow-md text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
