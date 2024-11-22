import { useState, useCallback } from "react";
import { ChatSession, Lecture } from "@/types";
import ErrorDisplay from "./ErrorDisplay";

interface Props {
  lectures: Lecture[];
  sessions: ChatSession[];
  onSessionSelect: (session: ChatSession) => void;
  onSessionCreate: (lectureId: number) => Promise<void>;
  selectedSession: ChatSession | null;
}

export default function AISessionManager({
  lectures,
  sessions,
  onSessionSelect,
  onSessionCreate,
  selectedSession,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<number | null>(null);

  const handleSessionCreate = useCallback(async () => {
    if (!selectedLecture) {
      setError("Please select a lecture first");
      return;
    }

    setError(null);
    setIsCreating(true);

    try {
      await onSessionCreate(selectedLecture);
      setSelectedLecture(null);
    } catch (err) {
      console.error(err);
      setError("Failed to create session. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }, [selectedLecture, onSessionCreate]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Create New Session
        </h2>
        <div className="space-y-3">
          <select
            value={selectedLecture || ""}
            onChange={(e) => setSelectedLecture(Number(e.target.value))}
            className="w-full p-2 border rounded-md"
            disabled={isCreating}
          >
            <option value="">Select a lecture</option>
            {lectures.map((lecture) => (
              <option key={lecture.id} value={lecture.id}>
                {lecture.title}
              </option>
            ))}
          </select>
          <button
            onClick={handleSessionCreate}
            disabled={!selectedLecture || isCreating}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Start New Chat"}
          </button>
        </div>
        {error && <ErrorDisplay message={error} />}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Chat History
        </h2>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {sessions.map((session) => {
            const lecture = lectures.find((l) => l.id === session.lectureId);
            return (
              <button
                key={session.id}
                onClick={() => onSessionSelect(session)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedSession?.id === session.id
                    ? "bg-indigo-50 border-indigo-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="font-medium text-gray-900">
                  {lecture?.title || "Unknown Lecture"}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(session.createdAt).toLocaleDateString()} -{" "}
                  {new Date(session.createdAt).toLocaleTimeString()}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {(session.messages as any[]).length} messages
                </div>
              </button>
            );
          })}
          {sessions.length === 0 && (
            <div className="text-gray-500 text-center py-4">
              No chat sessions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
