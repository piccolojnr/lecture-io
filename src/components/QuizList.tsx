"use client";

import { useState } from "react";
import StudyTimer from "./StudyTimer";
import { FlashcardSet, Lecture, QuizAnswerOption } from "@prisma/client";

interface QuizQuestion {
  id: number;
  question: string;
  explanation: string | null;
  quizId: number;
  topicId: number;
  options: QuizAnswerOption[];
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  questions: QuizQuestion[];
  flashcardSet: FlashcardSet | null;
  lectureId: number;
  Lecture: Lecture;
}

interface QuizListProps {
  quiz: Quiz;
}

export default function QuizList({ quiz }: QuizListProps) {
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizState, setQuizState] = useState({
    currentQuestion: 0,
    answers: [] as { questionId: number; answerId: number }[],
    score: 0,
    showResults: false,
  });

  const startQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setQuizState({
      currentQuestion: 0,
      answers: [],
      score: 0,
      showResults: false,
    });
  };

  const handleAnswer = async (optionId: number) => {
    if (!currentQuiz) return;

    const option = currentQuiz.questions[
      quizState.currentQuestion
    ].options.find((opt) => opt.id === optionId);

    const isCorrect = option?.correct || false;

    const updatedAnswers = [
      ...quizState.answers,
      {
        answerId: optionId,
        questionId: currentQuiz.questions[quizState.currentQuestion].id,
      },
    ];

    const updatedScore = quizState.score + (isCorrect ? 1 : 0);
    const isLastQuestion =
      quizState.currentQuestion + 1 === currentQuiz.questions.length;

    if (isLastQuestion) {
      // Update progress
      await saveQuizAttempt();

      setQuizState((prevState) => ({
        ...prevState,
        answers: updatedAnswers,
        score: updatedScore,
        showResults: true,
      }));
    } else {
      // Move to the next question
      setQuizState((prevState) => ({
        ...prevState,
        answers: updatedAnswers,
        score: updatedScore,
        currentQuestion: prevState.currentQuestion + 1,
      }));
    }
  };

  const saveQuizAttempt = async () => {
    if (!currentQuiz) return;

    try {
      await fetch(
        `/api/lectures/${currentQuiz.lectureId}/quizzes/${currentQuiz.id}/attempt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            score: quizState.score,
            answers: quizState.answers,
          }),
        }
      );
    } catch (error) {
      console.error("Failed to save quiz attempt:", error);
    }
  };

  if (!currentQuiz) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>
          <p className="text-gray-600 mb-4">
            {quiz.description || `${quiz.questions.length} questions`}
          </p>
          <button
            onClick={() => startQuiz(quiz)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (quizState.showResults) {
    const percentage = (quizState.score / currentQuiz.questions.length) * 100;

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Quiz Results</h3>
        <p className="text-lg mb-2">
          Score: {quizState.score}/{currentQuiz.questions.length} (
          {percentage.toFixed(1)}%)
        </p>
        <div className="space-y-4 mb-4">
          {currentQuiz.questions.map((question, index) => {
            const userAnswer = quizState.answers[index];
            const answerOption = question.options.find(
              (option) => option.correct
            ) || { id: -1 };
            const isCorrect = userAnswer.answerId === answerOption.id;

            return (
              <div
                key={index}
                className={`p-4 rounded ${
                  isCorrect ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <p className="font-medium mb-2">{question.question}</p>
                <p className="text-sm">
                  Your answer:{" "}
                  {question.options.find((x) => x.id === userAnswer.answerId)
                    ?.value || "N/A"}
                </p>
                <p className="text-sm">
                  Correct answer:{" "}
                  {question.options.find((x) => x.correct)?.value}
                </p>
                {question.explanation && (
                  <p className="text-sm text-gray-600 mt-2">
                    {question.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuiz(null)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Quizzes
          </button>

          <button
            onClick={() => startQuiz(currentQuiz)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Retry Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = currentQuiz.questions[quizState.currentQuestion];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <StudyTimer lectureId={currentQuiz.lectureId} type="quiz" />
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Question {quizState.currentQuestion + 1} of{" "}
          {currentQuiz.questions.length}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full"
            style={{
              width: `${
                ((quizState.currentQuestion + 1) /
                  currentQuiz.questions.length) *
                100
              }%`,
            }}
          />
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-4">{currentQuestion.question}</h3>
      <div className="space-y-2">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option.id)}
            className="w-full text-left p-4 rounded border hover:bg-gray-50"
          >
            {option.value}
          </button>
        ))}
      </div>
    </div>
  );
}
