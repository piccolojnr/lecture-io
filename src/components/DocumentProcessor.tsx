"use client";
import { useState } from "react";
import FileUpload from "./FileUpload";
import ErrorDisplay from "./ErrorDisplay";
import { ContentGenerator } from "./ContentGenerator";
import { ProcessingOptions } from "@/types";

export function DocumentProcessor() {
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [options, setOptions] = useState<ProcessingOptions>({
    type: "flashcard",
    createNewLecture: true,
    lectureId: "",
    lectureName: "",
    title: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setSuccess(null);
    setExtractedText(null);
    setProcessingStatus("Processing document...");

    try {
      const formData = new FormData();
      formData.append("files", file);

      const extractResponse = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
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
      setProcessingStatus(null);
    }
  };

  const handleTextInput = (text: string) => {
    setExtractedText(text);
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
            onTextInput={handleTextInput}
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Extracted Text Preview
              </h3>
              <textarea
                className="w-full text-sm text-gray-600 whitespace-pre-wrap max-h-60 overflow-y-auto p-2 border border-gray-300 rounded-md"
                value={extractedText}
                rows={15}
                onChange={(e) => setExtractedText(e.target.value)}
              />
            </div>

            <ContentGenerator
              extractedText={extractedText}
              lectureId={options.lectureId}
              options={options}
              setError={setError}
              setOptions={setOptions}
              setProcessingStatus={setProcessingStatus}
              setSuccess={setSuccess}
            />
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
        {processingStatus && (
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
            <span>{processingStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
}
