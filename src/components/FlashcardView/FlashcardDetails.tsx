import { Flashcard } from "@/types";

interface FlashcardDetailsProps {
  flashcards: Flashcard[];
  currentIndex: number;
}
const FlashcardDetails = ({}: FlashcardDetailsProps) => {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Code for displaying flashcards goes here */}
    </div>
  );
};

export default FlashcardDetails;
