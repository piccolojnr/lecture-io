"use client";
import { useState, useEffect } from "react";
import FileUpload from "./FileUpload";
import ErrorDisplay from "./ErrorDisplay";
import { ContentGenerator } from "./ContentGenerator";

interface ProcessingOptions {
  type: "flashcards" | "quiz";
  lectureId?: string;
  createNewLecture: boolean;
  lectureName?: string;
}

export function DocumentProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [options, setOptions] = useState<ProcessingOptions>({
    type: "flashcards",
    createNewLecture: false,
  });
  const [lectures, setLectures] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch existing lectures on mount
  useEffect(() => {
    fetchLectures();
  }, []);

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

  const handleFileSelect = async (file: File) => {
    setError(null);
    setSuccess(null);
    setExtractedText(null);
    setIsProcessing(true);

    try {
      // First, upload the file
      const formData = new FormData();
      formData.append("files", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const { url } = await uploadResponse.json();

      // Now extract text from the uploaded file
      const extractResponse = await fetch("/api/extract-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: url }),
      });

      if (!extractResponse.ok) {
        throw new Error("Failed to extract text from document");
      }

      const { text } = await extractResponse.json();
      setExtractedText(text);
      setSuccess("Successfully extracted text from document");
    } catch (error) {
      console.error("Error processing document:", error);
      setError(
        error instanceof Error ? error.message : "Failed to process document"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Process Document</h2>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Document
          </label>
          <FileUpload
            onFileSelect={handleFileSelect}
            setError={setError}
            setSelectedFile={setSelectedFile}
            selectedFile={selectedFile}
          />
        </div>

        {/* Extracted Text Preview */}
        {extractedText && (
          <div className="mt-6 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Extracted Text Preview</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap max-h-60 overflow-y-auto">
                {extractedText}
              </p>
            </div>
            
            <ContentGenerator 
              extractedText={extractedText}
              lectureId={options.lectureId}
            />
          </div>
        )}

        {/* Content Type Selection */}
        {extractedText && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generate Content Type
            </label>
            <select
              value={options.type}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  type: e.target.value as "flashcards" | "quiz",
                }))
              }
              className="w-full p-2 border rounded-lg"
            >
              <option value="flashcards">Flashcards</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>
        )}

        {/* Lecture Selection - Only show after text extraction */}
        {extractedText && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add to Lecture
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="existing"
                  checked={!options.createNewLecture}
                  onChange={() =>
                    setOptions((prev) => ({ ...prev, createNewLecture: false }))
                  }
                />
                <label htmlFor="existing">Use Existing Lecture</label>
              </div>
              {!options.createNewLecture && (
                <select
                  value={options.lectureId}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      lectureId: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select a lecture...</option>
                  {lectures.map((lecture: any) => (
                    <option key={lecture.id} value={lecture.id}>
                      {lecture.title}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="new"
                  checked={options.createNewLecture}
                  onChange={() =>
                    setOptions((prev) => ({ ...prev, createNewLecture: true }))
                  }
                />
                <label htmlFor="new">Create New Lecture</label>
              </div>
              {options.createNewLecture && (
                <input
                  type="text"
                  placeholder="Enter lecture name"
                  value={options.lectureName}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      lectureName: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-lg"
                />
              )}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <ErrorDisplay
            message={error}
            retry={() => {
              setError(null);
              if (selectedFile) handleFileSelect(selectedFile);
            }}
          />
        )}
        {success && (
          <div className="p-4 bg-green-50 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        {isProcessing && (
          <div className="p-4 bg-blue-50 text-blue-700 rounded-lg flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing document...</span>
          </div>
        )}

        {/* Process Button - Only show after text extraction */}
        {extractedText && (
          <button
            onClick={() => {
              /* TODO: Implement final processing */
            }}
            disabled={
              isProcessing || (!options.lectureId && !options.createNewLecture)
            }
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Content
          </button>
        )}
      </div>
    </div>
  );
}
