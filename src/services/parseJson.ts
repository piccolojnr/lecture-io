// parse jason file to make sur its in this format
// [
//     {
//         "question": "What is the capital of France?",
//         "answer": "Paris",
//         "topic": "Geography",
//         "additionalNotes": "Paris is also known as the City of Light." -> optional
//     },
//     ...
// ]

export async function parseLecturesJsonFile(file: File) {
    try {
        const text = await file.text();
        const flashcards = JSON.parse(text);
        if (!Array.isArray(flashcards)) {
            throw new Error("Invalid format: JSON should be an array of flashcards");
        }

        flashcards.forEach((flashcard, index) => {
            if (typeof flashcard.question !== 'string' || typeof flashcard.answer !== 'string' || typeof flashcard.topic !== 'string') {
                throw new Error(`Invalid format in flashcard at index ${index}: 'question', 'answer', and 'topic' must be strings`);
            }

            if (flashcard.additionalNotes && typeof flashcard.additionalNotes !== 'string') {
                throw new Error(`Invalid format in flashcard at index ${index}: 'additionalNotes' must be a string if provided`);
            }
        });

        console.log("JSON file parsed successfully and is in the correct format.");
        return flashcards;
    } catch (error: any) {
        console.error("Error parsing JSON file:", error.message);
        throw error;
    }
}
// [
// {
//     "question": "What is the primary function of an operating system?",
//     "options": [
//       "To manage software",
//       "To manage hardware",
//       "To manage users",
//       "To manage networks"
//     ],
//     "correctAnswer": "To manage hardware",
//     "topic": "Introduction to Operating System",
//     "explanation": "The operating system's primary function is to manage the hardware carefully, in order to achieve the best possible performance."
//   },
// ]
export async function parseQuizzesJsonFile(file: File) {
    try {
        const text = await file.text();
        const quizzes = JSON.parse(text);
        if (!Array.isArray(quizzes)) {
            throw new Error("Invalid format: JSON should be an array of quizzes");
        }

        quizzes.forEach((quiz, index) => {
            if (typeof quiz.question !== 'string' || !Array.isArray(quiz.options) || typeof quiz.correctAnswer !== 'string' || typeof quiz.topic !== 'string' || typeof quiz.explanation !== 'string') {
                throw new Error(`Invalid format in quiz at index ${index}: 'question', 'options', 'correctAnswer', 'topic', and 'explanation' must be strings`);
            }
        });

        console.log("JSON file parsed successfully and is in the correct format.");
        return quizzes;
    } catch (error: any) {
        console.error("Error parsing JSON file:", error.message);
        throw error;
    }
}