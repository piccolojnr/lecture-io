"use client";

import { useState } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  setError: (error: string | null) => void;
  setSelectedFile: (file: File | null) => void;
  selectedFile: File | null;
  onTextInput: (text: string) => void; // Callback for text input
}

export default function FileUpload({
  onFileSelect,
  setError,
  setSelectedFile,
  selectedFile,
  onTextInput,
}: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [textContent, setTextContent] = useState("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList) => {
    setError(null);

    if (files.length === 0) return;

    const file = files[0];
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/msword", // .doc
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF, TXT, or Word document");
      return;
    }

    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setTextContent(text);
    onTextInput(text); // Callback to pass the typed content
  };

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          type="file"
          onChange={handleFileInput}
          accept=".pdf,.txt,.doc,.docx"
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-blue-500 hover:text-blue-600"
        >
          {selectedFile ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p>
                Drop your file here or <span className="underline">browse</span>
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, TXT, and Word documents
              </p>
            </div>
          )}
        </label>
      </div>
      <div className="mt-4">
        <label
          htmlFor="text-input"
          className="block text-sm font-medium text-gray-700"
        >
          Or type your content:
        </label>
        <textarea
          id="text-input"
          value={textContent}
          onChange={handleTextInput}
          rows={5}
          className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Type your content here..."
        />
      </div>
    </div>
  );
}
