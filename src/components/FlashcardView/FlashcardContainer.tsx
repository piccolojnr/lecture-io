import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import FlashcardView from "@/components/FlashcardView/FlashcardView";
import TopicSelector from "@/components/Topic/TopicSelector";
import axios from "axios";
import { useParams, useSearchParams } from "next/navigation";
import { Flashcard } from "@/types";

interface Topic {
  percentageCompleted: number;
  name: string;
  id: string;
}

const FlashcardContainer = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [viewMode, setViewMode] = useState<"scatter_dots" | "flashcards">(
    "flashcards"
  );

  const params = useParams<{ lectureId: string }>();
  const lectureId = params?.lectureId;
  const searchParams = useSearchParams();
  const topicId = searchParams?.get("topicId");

  const fetchFlashcards = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      if (!lectureId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/flashcards`, {
          params: { lectureId, page, pageSize, topicId },
        });

        const data = response.data;
        setFlashcards(data.data);
        setTopics(data.topics);

        if (topicId) {
          const selectedTopic = data.topics.find((t: Topic) => t.id == topicId);
          setSelectedTopic(selectedTopic || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [lectureId, topicId]
  );

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards, lectureId]);

  return (
    <Layout>
      <div className="space-y-6">
        {isLoading && (
          <div className="grid gap-4 grid-cols-4 items-center">
            <div className="animate-pulse bg-gray-200 h-6 w-1/2 rounded-md"></div>
            <div className="animate-pulse bg-gray-200 h-6 w-1/3 rounded-md"></div>
            <div className="animate-pulse bg-gray-200 h-6 w-1/4 rounded-md"></div>
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && flashcards.length > 0 && (
          <FlashcardView
            flashcards={flashcards}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        )}
        {!isLoading && topics.length > 0 && (
          <TopicSelector
            topics={topics}
            lectureId={lectureId}
            selectedTopic={selectedTopic}
            onClear={() => setSelectedTopic(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default FlashcardContainer;
