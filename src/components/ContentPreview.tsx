"use client";

import { useState } from "react";
import { validateContent, normalizeContent } from "@/lib/content-validator";

interface ContentPreviewProps {
  content: any[];
  type: "quiz" | "flashcard";
  onApprove: () => void;
  onReject: () => void;
  onEdit: (editedContent: any[]) => void;
}

export function ContentPreview({
  content,
  type,
  onApprove,
  onReject,
  onEdit,
}: ContentPreviewProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validate content when component mounts or content changes
  const validateCurrentContent = () => {
    const result = validateContent(editMode ? editedContent : content, type);
    setValidationErrors(result.errors);
    return result.isValid;
  };

  const handleEdit = (index: number, field: string, value: any) => {
    const newContent = [...editedContent];
    newContent[index] = {
      ...newContent[index],
      [field]: value,
    };
    setEditedContent(newContent);
  };

  const handleSaveEdits = () => {
    const normalizedContent = normalizeContent(editedContent);
    const validationResult = validateContent(normalizedContent, type);

    if (validationResult.isValid) {
      onEdit(normalizedContent);
      setEditMode(false);
      setValidationErrors([]);
    } else {
      setValidationErrors(validationResult.errors);
    }
  };

  const renderQuizPreview = (item: any, index: number) => (
    <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
      <div className="space-y-4">
        {editMode ? (
          <>
            <textarea
              className="w-full p-2 border rounded"
              value={item.question}
              onChange={(e) => handleEdit(index, "question", e.target.value)}
            />
            <div className="space-y-2">
              {item.options.map((option: string, optIndex: number) => (
                <div key={optIndex} className="flex items-center space-x-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...item.options];
                      newOptions[optIndex] = e.target.value;
                      handleEdit(index, "options", newOptions);
                    }}
                  />
                  <input
                    type="radio"
                    checked={option === item.correctAnswer}
                    onChange={() => handleEdit(index, "correctAnswer", option)}
                  />
                </div>
              ))}
            </div>
            <textarea
              className="w-full p-2 border rounded"
              value={item.explanation || ""}
              placeholder="Explanation (optional)"
              onChange={(e) => handleEdit(index, "explanation", e.target.value)}
            />
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium">Question {index + 1}</h3>
            <p className="text-gray-700">{item.question}</p>
            <div className="space-y-2">
              {item.options.map((option: string, optIndex: number) => (
                <div
                  key={optIndex}
                  className={`p-2 rounded ${
                    option === item.correctAnswer
                      ? "bg-green-100 border-green-500"
                      : "bg-gray-50"
                  }`}
                >
                  {option}
                  {option === item.correctAnswer && (
                    <span className="ml-2 text-green-600">✓</span>
                  )}
                </div>
              ))}
            </div>
            {item.explanation && (
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <p className="text-sm text-blue-700">{item.explanation}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderFlashcardPreview = (item: any, index: number) => (
    <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
      <div className="space-y-4">
        {editMode ? (
          <>
            <textarea
              className="w-full p-2 border rounded"
              value={item.question}
              onChange={(e) => handleEdit(index, "question", e.target.value)}
            />
            <textarea
              className="w-full p-2 border rounded"
              value={item.answer}
              onChange={(e) => handleEdit(index, "answer", e.target.value)}
            />
            <textarea
              className="w-full p-2 border rounded"
              value={item.additionalNotes || ""}
              placeholder="Additional Notes (optional)"
              onChange={(e) =>
                handleEdit(index, "additionalNotes", e.target.value)
              }
            />
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium">Flashcard {index + 1}</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <p className="font-medium">Question:</p>
                <p className="text-gray-700">{item.question}</p>
              </div>
              <div className="p-4">
                <p className="font-medium">Answer:</p>
                <p className="text-gray-700">{item.answer}</p>
              </div>
            </div>
            {item.additionalNotes && (
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <p className="text-sm text-blue-700">{item.additionalNotes}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Preview Generated {type === "quiz" ? "Quiz" : "Flashcards"}
        </h2>
        <div className="space-x-4">
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {editMode ? "Cancel Editing" : "Edit Content"}
          </button>
          {editMode ? (
            <button
              onClick={handleSaveEdits}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          ) : (
            <>
              <button
                onClick={onReject}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Reject & Regenerate
              </button>
              <button
                onClick={() => {
                  if (validateCurrentContent()) {
                    onApprove();
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Approve & Save
              </button>
            </>
          )}
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 rounded-lg">
          <h3 className="text-sm font-medium text-red-800">
            Validation Errors:
          </h3>
          <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-6">
        {content.length > 0 && (
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              {currentIndex + 1} of {content.length}
            </span>
            <button
              onClick={() =>
                setCurrentIndex(Math.min(content.length - 1, currentIndex + 1))
              }
              disabled={currentIndex === content.length - 1}
              className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {content.length > 0 &&
          (type === "quiz"
            ? renderQuizPreview(
                editMode ? editedContent[currentIndex] : content[currentIndex],
                currentIndex
              )
            : renderFlashcardPreview(
                editMode ? editedContent[currentIndex] : content[currentIndex],
                currentIndex
              ))}
      </div>
    </div>
  );
}
