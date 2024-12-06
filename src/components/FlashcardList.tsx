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
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div
          className="p-4 sm:p-6 min-h-[200px] sm:min-h-[250px] cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-500 mb-4">
            <span>Card {currentIndex + 1} of {flashcards.length}</span>
            <span className="mt-1 sm:mt-0">Click to flip</span>
          </div>
          <div className="flex items-center justify-center h-32 sm:h-40 px-2 sm:px-4">
            <p className="text-base sm:text-lg md:text-xl text-center">
              {isFlipped ? currentFlashcard.answer : currentFlashcard.question}
            </p>
          </div>
          {currentFlashcard.additionalNotes && (
            <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-md">
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="font-medium">Note:</span> {currentFlashcard.additionalNotes}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        <button
          onClick={handlePrevious}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
          >
            {isFlipped ? 'Show Question' : 'Show Answer'}
          </button>
        </div>
        <button
          onClick={handleNext}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
