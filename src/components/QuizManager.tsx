'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface QuizManagerProps {
  lectureId: number;
  topicId: number;
}

export default function QuizManager({ lectureId, topicId }: QuizManagerProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    answer: 0,
    explanation: '',
  });

  const handleAddQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every(opt => opt)) {
      setQuestions([...questions, currentQuestion]);
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        answer: 0,
        explanation: '',
      });
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || questions.length === 0) return;

    try {
      const response = await fetch(`/api/lectures/${lectureId}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          topicId,
          questions: questions.map(q => ({
            ...q,
            options: JSON.stringify(q.options),
          })),
          options: questions.flatMap((q, qIndex) =>
            q.options.map((opt, optIndex) => ({
              value: opt,
              correct: optIndex === q.answer,
            }))
          ),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create quiz');
      }

      router.refresh();
      setTitle('');
      setDescription('');
      setQuestions([]);
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Create Quiz</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-2">Add Question</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Question</label>
              <input
                type="text"
                value={currentQuestion.question}
                onChange={(e) =>
                  setCurrentQuestion({ ...currentQuestion, question: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Options</label>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center mt-2">
                  <input
                    type="radio"
                    checked={currentQuestion.answer === index}
                    onChange={() =>
                      setCurrentQuestion({ ...currentQuestion, answer: index })
                    }
                    className="mr-2"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder={`Option ${index + 1}`}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Explanation
              </label>
              <textarea
                value={currentQuestion.explanation}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    explanation: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={2}
              />
            </div>

            <button
              type="button"
              onClick={handleAddQuestion}
              className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-200"
            >
              Add Question
            </button>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-2">Added Questions</h3>
            <ul className="space-y-2">
              {questions.map((q, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {index + 1}. {q.question}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t pt-4">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            disabled={!title || questions.length === 0}
          >
            Create Quiz
          </button>
        </div>
      </form>
    </div>
  );
}
