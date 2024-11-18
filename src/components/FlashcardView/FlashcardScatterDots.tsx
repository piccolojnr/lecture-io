import { Flashcard } from "@/types";

interface FlashcardScatterDotsProps {
  flashcards: Flashcard[];
  setCurrentIndex: (index: number) => void;
}
const FlashcardScatterDots = ({
  flashcards,
  setCurrentIndex,
}: FlashcardScatterDotsProps) => {
  return (
    <div className="flex items-center flex-wrap justify-center gap-2 max-w-2xl mx-auto">
      {flashcards.map((flashcard, index) => (
        <button
          key={index}
          onClick={() => setCurrentIndex(index)}
          className={`w-6 h-6 p-4 flex items-center justify-center rounded-full border-2 `}
          style={{
            background: `linear-gradient(to right, #4ade80 ${
              (flashcard.confidence / 5) * 100
            }%, #f1f5f9 ${(flashcard.confidence / 5) * 100}%)`,
          }}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
};

export default FlashcardScatterDots;
