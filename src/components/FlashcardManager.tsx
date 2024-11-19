"use client";
import { useState, useEffect } from "react";
import StudyTimer from "./StudyTimer";

interface FlashcardManagerProps {
  lectureId: number;
  initialFlashcards: any[];
}

export default function FlashcardManager({
  lectureId,
  initialFlashcards,
}: FlashcardManagerProps) {
  const [flashcards] = useState(initialFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  // const [progress, setProgress] = useState<any>(null);
  const [masteredCards, setMasteredCards] = useState<number[]>([]);

  useEffect(() => {
    // Fetch existing progress
    if (!lectureId) return;
    fetch(`/api/progress?lectureId=${lectureId}`)
      .then((res) => res.json())
      .then((data) => {
        // setProgress(data);
        if (data.flashcardIds) {
          setMasteredCards(JSON.parse(data.flashcardIds));
        }
      });
  }, [lectureId]);

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setShowAnswer(false);
    setCurrentIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
  };

  const toggleMastered = async () => {
    const currentCardId = flashcards[currentIndex].id;
    const newMasteredCards = masteredCards.includes(currentCardId)
      ? masteredCards.filter((id) => id !== currentCardId)
      : [...masteredCards, currentCardId];

    setMasteredCards(newMasteredCards);

    // Update progress
    await fetch("/api/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lectureId,
        type: "flashcard",
        data: JSON.stringify(newMasteredCards),
      }),
    });
  };

  if (flashcards.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-500">No flashcards available yet.</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const isMastered = masteredCards.includes(currentCard.id);

  return (
    <div className="space-y-4">
      <StudyTimer lectureId={lectureId} type="flashcard" />
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span>
            Mastered: {masteredCards.length} of {flashcards.length}
          </span>
        </div>

        <div
          className={`min-h-[200px] p-6 rounded-lg border-2 transition-colors cursor-pointer ${
            showAnswer
              ? "bg-indigo-50 border-indigo-200"
              : "bg-white border-gray-200"
          }`}
          onClick={() => setShowAnswer(!showAnswer)}
        >
          <div className="text-center">
            <p className="text-lg font-medium mb-4">
              {showAnswer ? currentCard.answer : currentCard.question}
            </p>
            <p className="text-sm text-gray-500">
              {showAnswer ? "Click to see question" : "Click to see answer"}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handlePrevious}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Previous
          </button>
          <button
            onClick={toggleMastered}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              isMastered
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {isMastered ? "Mastered" : "Mark as Mastered"}
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {flashcards.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setShowAnswer(false);
            }}
            className={`h-2 rounded-full ${
              index === currentIndex
                ? "bg-indigo-600"
                : masteredCards.includes(flashcards[index].id)
                ? "bg-green-500"
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
