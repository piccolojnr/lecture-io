import FlashcardScatterDots from "./FlashcardScatterDots";
import FlashcardDetails from "./FlashcardDetails";
import FlashcardControls from "./FlashcardControls";
import { Flashcard } from "@/types";
import { useState } from "react";

interface FlashcardViewProps {
  flashcards: Flashcard[];
  viewMode: "scatter_dots" | "flashcards";
  setViewMode: (viewMode: "scatter_dots" | "flashcards") => void;
}

const FlashcardView = ({
  flashcards,
  viewMode,
  setViewMode,
}: FlashcardViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const isScatterDots = viewMode === "scatter_dots";
  const isFlashcards = viewMode === "flashcards";

  const handleSetViewMode = (mode: "scatter_dots" | "flashcards") => {
    if (viewMode !== mode) {
      setViewMode(mode);
    }
  };

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-center gap-4">
        <ViewModeButton
          label="Scatter Dots"
          isActive={isScatterDots}
          onClick={() => handleSetViewMode("scatter_dots")}
        />
        <ViewModeButton
          label="Flashcards"
          isActive={isFlashcards}
          onClick={() => handleSetViewMode("flashcards")}
        />
      </div>

      {/* View Mode Content */}
      {isScatterDots && (
        <FlashcardScatterDots
          flashcards={flashcards}
          setCurrentIndex={setCurrentIndex}
        />
      )}
      {isFlashcards && (
        <>
          <FlashcardDetails
            flashcards={flashcards}
            currentIndex={currentIndex}
          />
          <FlashcardControls
            flashcards={flashcards}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
          />
        </>
      )}
    </div>
  );
};

export default FlashcardView;

interface ViewModeButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ViewModeButton = ({ label, isActive, onClick }: ViewModeButtonProps) => (
  <button
    onClick={onClick}
    className={`py-2 px-4 rounded-full text-sm font-semibold transition-all ${
      isActive
        ? "bg-green-500 text-white shadow-md"
        : "bg-white text-green-500 border border-green-500 hover:shadow"
    }`}
  >
    {label}
  </button>
);
