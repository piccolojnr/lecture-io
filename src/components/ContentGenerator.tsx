"use client";

import { Lecture, ProcessingOptions } from "@/types";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Use for redirection
import { toast } from "react-hot-toast";
import { ContentPreview } from "./ContentPreview";

interface ContentGeneratorProps {
  extractedText: string;
  lectureId?: string;
  options: ProcessingOptions;
  setOptions: Dispatch<SetStateAction<ProcessingOptions>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setProcessingStatus: Dispatch<SetStateAction<string | null>>;
  setSuccess: Dispatch<SetStateAction<string | null>>;
}

export function ContentGenerator({
  extractedText,
  lectureId,
  options,
  setOptions,
  setError,
  setProcessingStatus,
  setSuccess,
}: ContentGeneratorProps) {
  const router = useRouter(); // For redirection
  const [isGenerating, setIsGenerating] = useState(false);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [newLectureName, setNewLectureName] = useState("");
  const [newLectureDescription, setNewLectureDescription] = useState("");
  const [chunks, setChunks] = useState<string[]>([]);
  const [failedChunks, setFailedChunks] = useState([]);
  const [results, setResults] = useState<any[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [retryingSave, setRetryingSave] = useState(false);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const response = await fetch("/api/lectures");
        const data = await response.json();
        setLectures(data);
      } catch (error) {
        console.error("Failed to fetch lectures:", error);
        setError("Failed to load lectures");
      }
    };
    fetchLectures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateContent = async () => {
    setIsGenerating(true);
    setFailedChunks([]); // Reset failed chunks

    try {
      // Generate chunks
      setProcessingStatus("Generating chunks...");
      const responseChunks = await fetch("/api/generate-content/chunks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText }),
      });

      if (!responseChunks.ok) {
        throw new Error("Failed to generate chunks");
      }

      const dataChunks = await responseChunks.json();
      setChunks(dataChunks.chunks);

      // Generate content
      setProcessingStatus("Generating content...");
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chunks: dataChunks.chunks,
          type: options.type,
          apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
          lectureId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const data = await response.json();

      if (data.failedChunks.length > 0) {
        setFailedChunks(data.failedChunks);
        toast.error(
          `Generation partially completed. ${data.failedChunks.length} chunks failed.`
        );
      } else {
        toast.success("Content generated successfully!");
      }

      setSuccess("Content generated successfully!");
      setResults(data.results || []);
      if (
        data.results &&
        data.results.length > 0 &&
        data.failedChunks.length === 0
      )
        setShowPreview(true);
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Please try again.");
      setError("Failed to generate content");
    } finally {
      setIsGenerating(false);
      setProcessingStatus(null);
    }
  };

  const retryFailedChunks = async () => {
    if (failedChunks.length === 0) return;

    setIsGenerating(true);
    setProcessingStatus("Retrying failed chunks...");
    try {
      const response = await fetch("/api/generate-content/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          failedChunks,
          apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
          type: options.type,
          chunks,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to retry failed chunks");
      }

      const data = await response.json();
      if (data.failedChunks.length > 0) {
        setFailedChunks(data.failedChunks);
        toast.error(
          `Retry partially completed. ${data.failedChunks.length} chunks still failed.`
        );
      } else {
        toast.success("All failed chunks processed successfully!");
        setFailedChunks([]);
      }

      setResults((prev) => [...(prev || []), ...data.results]);
    } catch (error) {
      console.error("Error retrying failed chunks:", error);
      toast.error("Failed to retry chunks. Please try again.");
    } finally {
      setIsGenerating(false);
      setProcessingStatus(null);
    }
  };

  const handleApproveContent = async () => {
    if (!results) return;

    if (!options.lectureId && !options.createNewLecture) {
      setError("Please select a lecture or create a new one.");
      return;
    }

    if (!options.title) {
      setError("Please enter a title for the content.");
      return;
    }

    setProcessingStatus("Saving content...");
    setRetryingSave(false);

    const saveContent = async (retries = 3) => {
      try {
        const response = await fetch("/api/save-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: options.title,
            description: options.description,
            content: results,
            type: options.type,
            lectureId: !options.createNewLecture && options.lectureId,
            newLecture: options.createNewLecture && {
              title: newLectureName,
              description: newLectureDescription,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save content");
        }

        const data = await response.json();

        const lectureId = data.lectureId;

        toast.success("Content saved successfully!");
        setSuccess("Content saved successfully!");
        setShowPreview(false);
        setResults(null);

        // Redirect to lecture page
        router.push(`/lectures/${lectureId || "new"}`);
      } catch (error) {
        console.error("Error saving content:", error);

        if (retries > 0) {
          console.warn(`Retrying save (${retries} attempts remaining)...`);
          await saveContent(retries - 1);
        } else {
          setError("Failed to save content after multiple attempts.");
          toast.error("Failed to save content after multiple retries.");
        }
      } finally {
        setProcessingStatus(null);
        setRetryingSave(false);
      }
    };

    saveContent();
  };

  const handleRejectContent = () => {
    setResults(null);
    setShowPreview(false);
    generateContent(); // Automatically retry generation
  };

  const handleEditContent = (editedContent: any[]) => {
    setResults(editedContent);
  };

  return (
    <div className="space-y-4">
      {!showPreview ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={options.title}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full p-2 border rounded-lg"
              disabled={isGenerating || results !== null}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={options.description}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full p-2 border rounded-lg"
              disabled={isGenerating || results !== null}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generate Content Type
            </label>
            <select
              value={options.type}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, type: e.target.value as any }))
              }
              className="w-full p-2 border rounded-lg"
              disabled={isGenerating || results !== null}
            >
              <option value="flashcard">Flashcards</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Lecture
            </label>
            <select
              value={options.lectureId}
              onChange={(e) => {
                if (e.target.value === "") {
                  setOptions((prev) => ({
                    ...prev,
                    lectureId: e.target.value,
                    createNewLecture: true,
                  }));
                } else {
                  setOptions((prev) => ({
                    ...prev,
                    lectureId: e.target.value,
                    createNewLecture: false,
                  }));
                }
              }}
              className="w-full p-2 border rounded-lg"
              disabled={isGenerating || results !== null}
            >
              <option value="">Create New Lecture</option>
              {lectures.map((lecture) => (
                <option key={lecture.id} value={lecture.id}>
                  {lecture.title}
                </option>
              ))}
            </select>
          </div>

          {
            // Create new lecture form
            !options.lectureId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lecture Name
                  </label>
                  <input
                    type="text"
                    value={newLectureName}
                    onChange={(e) => setNewLectureName(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    disabled={isGenerating || results !== null}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lecture Description
                  </label>
                  <textarea
                    value={newLectureDescription}
                    onChange={(e) => setNewLectureDescription(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    disabled={isGenerating || results !== null}
                  />
                </div>
              </>
            )
          }

          {/* Retry Button */}
          {failedChunks.length > 0 && (
            <div>
              <p className="text-red-600">
                {failedChunks.length} chunks failed. You can retry processing
                them.
              </p>
              <button
                onClick={retryFailedChunks}
                className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={retryingSave}
              >
                {retryingSave ? "Retrying..." : "Retry Failed Chunks"}
              </button>
            </div>
          )}

          <button
            onClick={generateContent}
            disabled={
              isGenerating || (!options.lectureId && !options.createNewLecture)
            }
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                <span>Generating...</span>
              </div>
            ) : (
              "Generate Content"
            )}
          </button>
        </>
      ) : (
        results && (
          <ContentPreview
            content={results}
            type={options.type}
            onApprove={handleApproveContent}
            onReject={handleRejectContent}
            onEdit={handleEditContent}
          />
        )
      )}
    </div>
  );
}
