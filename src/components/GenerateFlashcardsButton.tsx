import { useState } from "react";
import { Lecture } from "@/types";
import { FlashcardGenerator } from "@/services/flashcardGenerator";

interface GenerateFlashcardsButtonProps {
  lecture: Lecture;
  onSuccess?: () => void;
}

const GenerateFlashcardsButton = ({
  lecture,
  onSuccess,
}: GenerateFlashcardsButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateFlashcards = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const flashcards = FlashcardGenerator.generateFromLecture(lecture);

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flashcards),
      });

      if (!response.ok) {
        throw new Error("Failed to store flashcards");
      }

      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate flashcards"
      );
      console.error("Error generating flashcards:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleGenerateFlashcards}
        disabled={isGenerating}
        className="inline-flex items-center px-4 py-2 bg-primary text-green-600 rounded-md
          hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Generating Flashcards...
          </>
        ) : (
          "Generate Flashcards"
        )}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default GenerateFlashcardsButton;
