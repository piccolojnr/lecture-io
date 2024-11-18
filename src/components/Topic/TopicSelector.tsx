import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface Topic {
  percentageCompleted: number;
  name: string;
  id: string;
}

interface TopicSelectorProps {
  topics: Topic[];
  lectureId?: string;
  selectedTopic: Topic | null;
  onClear: () => void;
}

const TopicSelector = ({
  topics,
  lectureId,
  selectedTopic,
  onClear,
}: TopicSelectorProps) => {
  const router = useRouter();

  const handleClearFilter = () => {
    if (lectureId) {
      onClear();
      router.push(`/flashcards/${lectureId}`);
    }
  };

  const handleTopicSelect = (topicId: string) => {
    if (lectureId) {
      router.push(`/flashcards/${lectureId}?topicId=${topicId}`);
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-md max-w-2xl mx-auto">
      {selectedTopic ? (
        <SelectedTopicView
          topic={selectedTopic}
          onClearFilter={handleClearFilter}
        />
      ) : (
        <TopicList topics={topics} onSelectTopic={handleTopicSelect} />
      )}
    </div>
  );
};

interface SelectedTopicViewProps {
  topic: Topic;
  onClearFilter: () => void;
}

const SelectedTopicView = ({
  topic,
  onClearFilter,
}: SelectedTopicViewProps) => (
  <p className="text-gray-600">
    Viewing flashcards for selected topic: <strong>{topic.name}</strong>
    <button
      onClick={onClearFilter}
      className="text-blue-500 hover:underline ml-2"
    >
      Clear filter
    </button>
  </p>
);

interface TopicListProps {
  topics: Topic[];
  onSelectTopic: (topicId: string) => void;
}
const getTopicBackground = (topic: Topic) => {
  return `linear-gradient(90deg, #31b4ce ${topic.percentageCompleted}%, #dfe7e5 ${topic.percentageCompleted}%)`;
};
const TopicList = ({ topics, onSelectTopic }: TopicListProps) => {
  return (
    <ul className="flex items-center justify-center flex-wrap gap-2">
      {topics.map((topic) => (
        <li key={topic.id}>
          <button
            onClick={() => onSelectTopic(topic.id)}
            className={`py-2 px-4 rounded-lg text-sm font-semibold text-slate-700`}
            style={{
              background: getTopicBackground(topic),
            }}
          >
            {topic.name}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TopicSelector;
