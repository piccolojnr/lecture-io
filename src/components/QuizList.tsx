"use client";
import { useState, useEffect } from "react";
import StudyTimer from "./StudyTimer";

interface QuizListProps {
  quizzes: any[];
  lectureId: number;
}

export default function QuizList({ quizzes, lectureId }: QuizListProps) {
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    // Fetch existing progress
    fetch(`/api/progress?lectureId=${lectureId}`)
      .then((res) => res.json())
      .then((data) => {
        setProgress(data);
      });
  }, [lectureId]);

  const startQuiz = (quiz: any) => {
    setCurrentQuiz(quiz);
    setCurrentQuestion(0);
    setAnswers([]);
    setScore(0);
    setShowResults(false);
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (optionIndex === currentQuiz.questions[currentQuestion].answer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < currentQuiz.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const finalScore =
        score +
        (optionIndex === currentQuiz.questions[currentQuestion].answer ? 1 : 0);
      const percentage = (finalScore / currentQuiz.questions.length) * 100;

      // Update progress
      const quizScores = progress?.quizScores
        ? JSON.parse(progress.quizScores)
        : {};
      quizScores[new Date().toISOString()] = percentage;

      fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lectureId,
          type: "quiz",
          data: JSON.stringify(quizScores),
        }),
      });

      setShowResults(true);
    }
  };

  if (!currentQuiz) {
    return (
      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-lg shadow p-6">
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
        ))}
      </div>
    );
  }

  if (showResults) {
    const percentage = (score / currentQuiz.questions.length) * 100;
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Quiz Results</h3>
        <p className="text-lg mb-2">
          Score: {score}/{currentQuiz.questions.length} ({percentage.toFixed(1)}
          %)
        </p>
        <div className="space-y-4 mb-4">
          {currentQuiz.questions.map((question: any, index: number) => (
            <div
              key={index}
              className={`p-4 rounded ${
                answers[index] === question.answer
                  ? "bg-green-100"
                  : "bg-red-100"
              }`}
            >
              <p className="font-medium mb-2">{question.question}</p>
              <p className="text-sm">
                Your answer: {JSON.parse(question.options)[answers[index]]}
              </p>
              <p className="text-sm">
                Correct answer: {JSON.parse(question.options)[question.answer]}
              </p>
              {question.explanation && (
                <p className="text-sm text-gray-600 mt-2">
                  {question.explanation}
                </p>
              )}
            </div>
          ))}
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

  const question = currentQuiz.questions[currentQuestion];
  const options = JSON.parse(question.options);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <StudyTimer lectureId={lectureId} type="quiz" />
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Question {currentQuestion + 1} of {currentQuiz.questions.length}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full"
            style={{
              width: `${
                ((currentQuestion + 1) / currentQuiz.questions.length) * 100
              }%`,
            }}
          />
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-4">{question.question}</h3>
      <div className="space-y-2">
        {options.map((option: string, index: number) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            className="w-full text-left p-4 rounded border hover:bg-gray-50"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
