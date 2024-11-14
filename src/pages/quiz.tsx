import { useState } from "react";
import { Quiz, QuizQuestion } from "../types";
import Layout from "@/components/Layout";

const QuizSection = () => {
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Quiz</h1>

        {currentQuiz ? (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Question {currentQuestionIndex + 1} of{" "}
                {currentQuiz.questions.length}
              </h2>
              <p className="text-gray-800">
                {currentQuiz.questions[currentQuestionIndex].question}
              </p>
            </div>

            <div className="space-y-3">
              {currentQuiz.questions[currentQuestionIndex].options.map(
                (option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(index)}
                    className={`w-full p-3 text-left rounded ${
                      selectedAnswer === index
                        ? "bg-primary text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {option}
                  </button>
                )
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">No quiz available</p>
        )}
      </div>
    </Layout>
  );
};

export default QuizSection;
