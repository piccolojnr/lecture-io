import { Flashcard } from "@/types";
interface FlashcardDetailsProps {
  flashcards: Flashcard[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

const FlashcardControls = ({}: FlashcardDetailsProps) => {
  return (
    <div className="mt-6 space-y-4">
      {/* Code for previous/next and confidence level buttons */}
    </div>
  );
};

export default FlashcardControls;
