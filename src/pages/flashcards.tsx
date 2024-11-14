import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useLectures } from "@/contexts/LectureContext";

const Flashcards = () => {
  const { flashcards, fetchFlashcards } = useLectures();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const handleNext = () => {
    if (currentIndex < flashcards.data.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleConfidenceUpdate = async (confidence: number) => {
    const currentFlashcard = flashcards.data[currentIndex];
    try {
      await fetch(`/api/flashcards`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentFlashcard.id,
          confidence,
        }),
      });
      handleNext();
    } catch (error) {
      console.error("Error updating confidence:", error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>

        {flashcards.data.length > 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Card {currentIndex + 1} of {flashcards.data.length}
              </span>
              <span>
                Confidence Level: {flashcards.data[currentIndex].confidence}/5
              </span>
            </div>

            <div
              className={`bg-white rounded-lg shadow-lg p-8 min-h-[300px] cursor-pointer 
                transition-all duration-300 transform perspective-1000 
                ${isFlipped ? "rotate-y-180" : ""}`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="text-center text-xl">
                {isFlipped
                  ? flashcards.data[currentIndex].answer
                  : flashcards.data[currentIndex].question}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === flashcards.data.length - 1}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>

              {isFlipped && (
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleConfidenceUpdate(level)}
                      className={`w-10 h-10 rounded-full border-2 
                        ${
                          level <= flashcards.data[currentIndex].confidence
                            ? "bg-green-500 border-green-600 text-white"
                            : "border-gray-300 hover:border-green-500"
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}
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
      </div>
    </Layout>
  );
};

export default Flashcards;
