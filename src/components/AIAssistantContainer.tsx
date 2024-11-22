"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatSession, Lecture } from "@/types";
import AIStudyAssistant from "./AIStudyAssistant";
import AISessionManager from "./AISessionManager";
import ErrorDisplay from "./ErrorDisplay";

interface Props {
  lectures: Lecture[];
}

export default function AIAssistantContainer({ lectures }: Props) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await fetch("/api/ai-assistant/sessions");
        if (!response.ok) {
          throw new Error("Failed to load sessions");
        }
        const data = await response.json();
        setSessions(data);
      } catch (err: any) {
        console.error(err);
        setError(
          "Failed to load chat sessions. Please try refreshing the page."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  const handleSessionCreate = useCallback(async (lectureId: number) => {
    try {
      const response = await fetch("/api/ai-assistant/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lectureId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const newSession = await response.json();
      setSessions((prev) => [newSession, ...prev]);
      setSelectedSession(newSession);
    } catch (err) {
      console.error(err);
      setError("Failed to create a new session. Please try again.");
    }
  }, []);

  const handleSessionSelect = useCallback((session: ChatSession) => {
    setSelectedSession(session);
  }, []);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorDisplay message={error} retry={() => window.location.reload()} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Session Manager */}
        <div className="lg:col-span-1">
          <AISessionManager
            lectures={lectures}
            sessions={sessions}
            selectedSession={selectedSession}
            onSessionSelect={handleSessionSelect}
            onSessionCreate={handleSessionCreate}
          />
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <AIStudyAssistant
            lectures={lectures}
            session={selectedSession}
            onSessionCreate={async () => {
              if (lectures.length > 0) {
                await handleSessionCreate(parseInt(lectures[0].id));
                return selectedSession;
              }
              return null;
            }}
          />
        </div>
      </div>
    </div>
  );
}
