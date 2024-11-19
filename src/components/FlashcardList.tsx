'use client';

import { useState } from 'react';
import { Flashcard } from '@prisma/client';

interface FlashcardListProps {
  flashcards: Array<Flashcard>;
}

export default function FlashcardList({ flashcards }: FlashcardListProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentFlashcard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (flashcards.length === 0) {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow">
        <p className="text-gray-500">No flashcards available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div
          className="p-6 min-h-[200px] cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>Card {currentIndex + 1} of {flashcards.length}</span>
            <span>Click to flip</span>
          </div>
          <div className="flex items-center justify-center h-32">
            <p className="text-lg text-center">
              {isFlipped ? currentFlashcard.answer : currentFlashcard.question}
            </p>
          </div>
          {currentFlashcard.additionalNotes && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Note:</span> {currentFlashcard.additionalNotes}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Previous
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            {isFlipped ? 'Show Question' : 'Show Answer'}
          </button>
        </div>
        <button
          onClick={handleNext}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
