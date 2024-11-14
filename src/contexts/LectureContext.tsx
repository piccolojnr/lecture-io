import { createContext, useContext, useState, useCallback } from "react";
import { Lecture, Flashcard } from "../types";
import { FlashcardGenerator } from "@/services/flashcardGenerator";

interface PaginationResponse<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface LectureContextType {
  lectures: PaginationResponse<Lecture>;
  flashcards: PaginationResponse<Flashcard>;
  addLectures: (newLectures: Lecture[]) => Promise<void>;
  fetchLectures: (page?: number, pageSize?: number) => Promise<void>;
  fetchFlashcards: (page?: number, pageSize?: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const LectureContext = createContext<LectureContextType | undefined>(undefined);

export function LectureProvider({ children }: { children: React.ReactNode }) {
  const [lectures, setLectures] = useState<PaginationResponse<Lecture>>({
    data: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
  });
  const [flashcards, setFlashcards] = useState<PaginationResponse<Flashcard>>({
    data: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLectures = useCallback(async (newLectures: Lecture[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // Store lectures in the database
      const response = await fetch("/api/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLectures),
      });

      if (!response.ok) throw new Error("Failed to store lectures");

      // Generate flashcards
      const newFlashcards = newLectures.flatMap((lecture) =>
        FlashcardGenerator.generateFromLecture(lecture)
      );

      // Store flashcards in the database
      await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFlashcards),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error adding lectures:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLectures = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/lectures?page=${page}&pageSize=${pageSize}`
        );
        if (!response.ok) throw new Error("Failed to fetch lectures");

        const data: PaginationResponse<Lecture> = await response.json();
        setLectures(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching lectures:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchFlashcards = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/flashcards?page=${page}&pageSize=${pageSize}`
        );
        if (!response.ok) throw new Error("Failed to fetch flashcards");

        const data: PaginationResponse<Flashcard> = await response.json();
        setFlashcards(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching flashcards:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <LectureContext.Provider
      value={{
        lectures,
        flashcards,
        addLectures,
        fetchFlashcards,
        fetchLectures,
        isLoading,
        error,
      }}
    >
      {children}
    </LectureContext.Provider>
  );
}

export function useLectures() {
  const context = useContext(LectureContext);
  if (context === undefined) {
    throw new Error("useLectures must be used within a LectureProvider");
  }
  return context;
}
