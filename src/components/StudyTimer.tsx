import { useState, useEffect, useCallback } from "react";

interface StudyTimerProps {
  lectureId: number;
  type: "quiz" | "flashcard" | "study";
  isActive?: boolean;
}

export default function StudyTimer({
  lectureId,
  type,
  isActive = true,
}: StudyTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(isActive);

  /**
   * Save a study session to the database.
   * @param {number} lectureId - The ID of the lecture that was studied.
   * @param {"quiz" | "flashcard" | "study"} type - The type of study session.
   * @param {number} duration - The duration of the study session in seconds.
   * @throws {Error} Failed to save study session.
   */
  const saveStudySession = useCallback(async () => {
    try {
      await fetch("/api/study-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lectureId,
          type,
          duration: seconds,
        }),
      });
    } catch (error) {
      console.error("Failed to save study session:", error);
    }
  }, [lectureId, seconds, type]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        // Save study session when timer stops
        if (seconds > 0) {
          saveStudySession();
        }
      }
    };
  }, [isRunning, saveStudySession, seconds]);

  useEffect(() => {
    setIsRunning(isActive);
  }, [isActive]);
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <span className="font-medium">Study Time:</span>
      <span className="font-mono">{formatTime(seconds)}</span>
      <button
        onClick={() => setIsRunning(!isRunning)}
        className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200"
      >
        {isRunning ? "Pause" : "Resume"}
      </button>
    </div>
  );
}
