"use client";

import { useState, useEffect } from "react";
import { Flashcard } from "@prisma/client";

interface SpacedRepetitionStudyProps {
  lectureId: number;
  initialFlashcards: Flashcard[];
}

// Spaced repetition intervals in days
const intervals = [0, 1, 3, 7, 14, 30];

export default function SpacedRepetitionStudy({
  lectureId,
  initialFlashcards,
}: SpacedRepetitionStudyProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Filter and sort flashcards that need review
    const now = new Date();
    const dueFlashcards = initialFlashcards.filter(
      (f) => !f.nextReview || new Date(f.nextReview) <= now
    );
    setFlashcards(dueFlashcards);
  }, [initialFlashcards]);

  const handleConfidenceRating = async (confidence: number) => {
    if (currentIndex >= flashcards.length) return;

    const flashcard = flashcards[currentIndex];
    const now = new Date();
    const interval = intervals[confidence];
    const nextReview = new Date(now.setDate(now.getDate() + interval));

    try {
      const response = await fetch(
        `/api/lectures/${lectureId}/flashcards/${flashcard.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            confidence,
            lastReviewed: now.toISOString(),
            nextReview: nextReview.toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update flashcard");
      }

      if (currentIndex === flashcards.length - 1) {
        setIsFinished(true);
      } else {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      }
    } catch (error) {
      console.error("Error updating flashcard:", error);
    }
  };

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">
          No flashcards due for review!
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Check back later for more cards to review.
        </p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">
          Review session complete!
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Great job! Come back later for more review.
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setIsFinished(false);
            setIsFlipped(false);
          }}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Start Over
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4 text-sm text-gray-500">
        Card {currentIndex + 1} of {flashcards.length}
      </div>

      <div
        className={`bg-white rounded-lg shadow-lg p-6 mb-4 min-h-[200px] cursor-pointer transform transition-transform duration-300 ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="text-lg font-medium">
          {isFlipped ? currentCard.answer : currentCard.question}
        </div>
        {isFlipped && currentCard.additionalNotes && (
          <div className="mt-4 text-sm text-gray-500">
            Note: {currentCard.additionalNotes}
          </div>
        )}
      </div>

      {isFlipped && (
        <div className="space-y-2">
          <div className="text-sm text-gray-500 mb-2">
            How well did you know this?
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleConfidenceRating(1)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Again (1 day)
            </button>
            <button
              onClick={() => handleConfidenceRating(3)}
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
            >
              Hard (3 days)
            </button>
            <button
              onClick={() => handleConfidenceRating(5)}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Easy (7 days)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
