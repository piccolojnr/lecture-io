import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import { Flashcard } from "@prisma/client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

interface Topic {
  percentageCompleted: number;
  name: string;
  id: string;
}

const Flashcards = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [viewMode, setViewMode] = useState<"scatter_dots" | "flashcards">(
    "flashcards"
  );
  const params = useParams<{ lectureId: string }>();
  const lectureId = params?.lectureId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = searchParams?.get("topicId");

  const [additionalNotesOpen, setAdditionalNotesOpen] = useState(false);

  const fetchFlashcards = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      if (!lectureId) {
        return;
      }

      setIsLoading(true);
      setError(null);

      setIsFlipped(false);
      setAdditionalNotesOpen(false);
      setCurrentIndex(0);

      try {
        console.log("lectureId:", lectureId, "topicId:", topicId);
        const response = await axios.get(`/api/flashcards`, {
          params: { lectureId, page, pageSize, topicId },
        });

        const data: {
          data: Flashcard[];
          topics: Topic[];
          mostRecentlyViewedFlashcard: Flashcard | null;
          percentageCompleted: number;
        } = response.data;
        setFlashcards(data.data);
        setTopics(data.topics);

        if (data.mostRecentlyViewedFlashcard) {
          for (const flashcard of data.data) {
            if (
              data.mostRecentlyViewedFlashcard &&
              flashcard.id === data.mostRecentlyViewedFlashcard.id
            ) {
              setCurrentIndex(data.data.indexOf(flashcard));
              break;
            }
          }
        }
        if (topicId) {
          const selectedTopic = data.topics.find((t) => t.id == topicId);
          setSelectedTopic(selectedTopic || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching flashcards:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [lectureId, topicId]
  );

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards, lectureId]);

  const handleNext = async () => {
    if (flashcards[currentIndex].confidence === 0) {
      await handleConfidenceUpdate(1);
    }
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setAdditionalNotesOpen(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleConfidenceUpdate = async (confidence: any) => {
    const currentFlashcard = flashcards[currentIndex];
    try {
      await axios.patch(`/api/flashcards`, {
        id: currentFlashcard.id,
        confidence,
      });

      setFlashcards((prev) =>
        prev.map((flashcard) =>
          flashcard.id === currentFlashcard.id
            ? { ...flashcard, confidence }
            : flashcard
        )
      );
    } catch (error) {
      console.error("Error updating confidence:", error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          {isLoading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
        </div>

        {/* selected topic */}

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setViewMode("scatter_dots")}
            className="px-4 py-2 rounded-full border border-gray-300 shadow-sm hover:bg-gray-100 bg-white"
            style={{
              backgroundColor:
                viewMode === "scatter_dots" ? "#4ade80" : "white",
              color: viewMode === "scatter_dots" ? "white" : "#4ade80",
            }}
            disabled={viewMode === "scatter_dots"}
          >
            Scatter Dots
          </button>
          <button
            onClick={() => setViewMode("flashcards")}
            className="px-4 py-2 rounded-full border border-gray-300 shadow-sm hover:bg-gray-100 bg-white"
            style={{
              backgroundColor: viewMode === "flashcards" ? "#4ade80" : "white",
              color: viewMode === "flashcards" ? "white" : "#4ade80",
            }}
            disabled={viewMode === "flashcards"}
          >
            Flashcards
          </button>
        </div>

        {flashcards && flashcards.length > 0 && (
          <h1 className="text-3xl font-bold text-gray-900 capitalize mb-4 max-w-2xl mx-auto">
            {(flashcards[currentIndex] as any).Lecture.title} Flashcards
          </h1>
        )}

        {topicId && selectedTopic && (
          <div className="bg-gray-100 p-4 rounded-md max-w-2xl mx-auto">
            <p className="text-gray-600">
              Viewing flashcards for selected topic:{" "}
              <strong>{selectedTopic.name}</strong>.{" "}
              <button
                onClick={() => {
                  router.push(`/flashcards/${lectureId}`);
                }}
                className="text-blue-500 hover:underline"
              >
                Clear filter
              </button>
            </p>
          </div>
        )}

        {flashcards && flashcards.length > 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Card {currentIndex + 1} of {flashcards.length}
              </span>
              <span>
                Confidence Level: {flashcards[currentIndex].confidence}/5
              </span>
            </div>
            <div
              className="flex items-center justify-center gap-2"
              style={{ color: "#4ade80" }}
            >
              <p className="text-gray-600 text-sm">
                {(flashcards[currentIndex] as any).Topic.name}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <p className="mb-4">No flashcards available</p>
            <p className="text-sm">
              Upload some lectures to generate flashcards!
            </p>
          </div>
        )}

        {
          // Scatter Dots View
        }
        {viewMode === "scatter_dots" && (
          <div className="flex items-center flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            {flashcards.map((flashcard, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-6 h-6 p-4 flex items-center justify-center rounded-full border-2 `}
                style={{
                  background: `linear-gradient(to right, #4ade80 ${
                    (flashcard.confidence / 5) * 100
                  }%, ${
                    currentIndex === index
                      ? "rgb(132, 190, 45, 0.2)"
                      : "#f1f5f9"
                  } ${(flashcard.confidence / 5) * 100}%)`,
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}

        {
          // Flashcards View
        }
        {viewMode === "flashcards" && flashcards && flashcards.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="group h-96 w-96 [perspective:1000px] mx-auto relative overflow-hidden rounded-xl shadow-xl ">
              <div
                className={`relative h-full w-full rounded-xl shadow-xl transition-all duration-500 [transform-style:preserve-3d] ${
                  isFlipped ? "[transform:rotateY(180deg)]" : ""
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front Face */}

                <div className="absolute inset-0 h-full w-full rounded-xl bg-white p-8 [backface-visibility:hidden]">
                  <div className="flex items-center justify-center h-full text-center text-xl">
                    {flashcards[currentIndex].question}
                  </div>
                </div>

                {/* Back Face */}

                <div className="absolute inset-0 h-full w-full rounded-xl bg-gray-800 text-white p-8 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <div className="flex flex-col items-center justify-center h-full text-center text-xl space-y-2">
                    <div className="fit-text">
                      {flashcards[currentIndex].answer}
                    </div>
                  </div>
                  {flashcards[currentIndex].additionalNotes && (
                    <div
                      className={`bg-gray-700 text-white px-4 py-2 text-sm font-bold rounded-t-md absolute left-0 right-0 transition-all duration-500 ease-in-out mx-4  cursor-pointer flex flex-col justify-center items-center
                    ${isFlipped ? "-bottom-0" : "-bottom-20"}
                    ${
                      additionalNotesOpen && isFlipped
                        ? "bottom-0"
                        : "bottom-[-0px]"
                    }`}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the card flip when clicking the button
                        setAdditionalNotesOpen(!additionalNotesOpen);
                      }}
                    >
                      <div className="bg-white w-6 h-1 rounded-full" />
                      <div
                        className={`mt-2 overflow-hidden transition-all duration-500 ease-in-out ${
                          additionalNotesOpen && isFlipped
                            ? "max-h-40"
                            : "max-h-0"
                        }`}
                      >
                        <p className="text-white">
                          {flashcards[currentIndex].additionalNotes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === flashcards.length - 1}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>

              <div
                className="p-4 border border-gray-200 rounded flx flex-col items-center justify-center"
                style={{ backgroundColor: "#f7f7f7" }}
              >
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={async () => {
                        await handleConfidenceUpdate(level);
                        handleNext();
                      }}
                      className={`w-10 h-10 rounded-full border-2 ${
                        level <= flashcards[currentIndex].confidence
                          ? "bg-green-500 border-green-600 text-white"
                          : "border-gray-300 hover:border-green-500"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2 flex gap-6 items-center justify-center">
                  <p>1: I don&apos;t know</p>
                  <p>5: I know it well</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {flashcards && flashcards.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-xl text-center font-bold">Related Topics</h2>
            <ul className="mt-6 flex items-center justify-center flex-wrap gap-2">
              {topics.map((topic, index) => (
                <li key={index} className="text-gray-700">
                  <button
                    onClick={() => {
                      router.push(
                        `/flashcards/${lectureId}?topicId=${topic.id}`
                      );
                    }}
                    className={`px-4 py-1 rounded-full border border-gray-300 shadow-sm hover:bg-gray-100 bg-white ${
                      topicId == topic.id ? "bg-slate-600" : ""
                    }`}
                    style={{
                      background: `linear-gradient(to right, #4ade80 ${
                        topic.percentageCompleted
                      }%, ${
                        topicId == topic.id ||
                        (flashcards[currentIndex] as any).Topic.id == topic.id
                          ? "rgb(132, 190, 45, 0.2)"
                          : "#f1f5f9"
                      } ${topic.percentageCompleted}%)`,
                    }}
                  >
                    {topic.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <p className="mb-4">No flashcards available</p>
            <p className="text-sm">
              Upload some lectures to generate flashcards!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

import FlashcardContainer from "@/components/FlashcardView/FlashcardContainer";

const LectureFlashcards = () => {
  return <FlashcardContainer />;
};

export default LectureFlashcards;
