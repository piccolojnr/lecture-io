import { z } from 'zod';

// Define the schema for quiz questions
const quizSchema = z.array(z.object({
  question: z.string().min(2, "Question must be at least 2 characters long"),
  options: z.array(z.string().min(1, "Option must not be empty")).length(4, "Must have exactly 4 options"),
  correctAnswer: z.string().refine(
    (val) => val.length > 0,
    "Correct answer must not be empty"
  ),
  topic: z.string().min(2, "Topic must be at least 2 characters long"),
  explanation: z.string().max(500, "Explanation must not exceed 500 characters").optional(),
}));

// Define the schema for flashcards
const flashcardSchema = z.array(z.object({
  question: z.string().min(2, "Question must be at least 2 characters long"),
  answer: z.string().min(2, "Answer must be at least 2 characters long"),
  topic: z.string().min(2, "Topic must be at least 2 characters long"),
  additionalNotes: z.string().max(500, "Additional notes must not exceed 500 characters").optional(),
}));

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data: any;
}

export function validateContent(content: any, type: 'quiz' | 'flashcard'): ValidationResult {
  try {
    // Basic structure validation
    if (!Array.isArray(content)) {
      return {
        isValid: false,
        errors: ['Content must be an array'],
        data: null
      };
    }

    // Content-specific validation
    const schema = type === 'quiz' ? quizSchema : flashcardSchema;
    const result = schema.safeParse(content);

    if (!result.success) {
      return {
        isValid: false,
        errors: result.error.errors.map(err =>
          `${err.path.join('.')} - ${err.message}`
        ),
        data: null
      };
    }

    // Additional validation for quiz content
    if (type === 'quiz') {
      const quizErrors: string[] = [];
      content.forEach((item: any, index: number) => {
        // Validate that correctAnswer is one of the options
        if (!item.options.includes(item.correctAnswer)) {
          quizErrors.push(
            `Question ${index + 1}: Correct answer must be one of the options`
          );
        }
        // Check for duplicate options
        const uniqueOptions = new Set(item.options);
        if (uniqueOptions.size !== item.options.length) {
          quizErrors.push(
            `Question ${index + 1}: Options must be unique`
          );
        }
      });

      if (quizErrors.length > 0) {
        return {
          isValid: false,
          errors: quizErrors,
          data: null
        };
      }
    }

    // Additional validation for flashcards
    if (type === 'flashcard') {
      const flashcardErrors: string[] = [];
      content.forEach((item: any, index: number) => {
        // Check for question/answer similarity to prevent obvious answers
        if (item.question.toLowerCase() === item.answer.toLowerCase()) {
          flashcardErrors.push(
            `Flashcard ${index + 1}: Question and answer should not be identical`
          );
        }
      });

      if (flashcardErrors.length > 0) {
        return {
          isValid: false,
          errors: flashcardErrors,
          data: null
        };
      }
    }

    return {
      isValid: true,
      errors: [],
      data: result.data
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ['Failed to validate content: ' + (error as Error).message],
      data: null
    };
  }
}

// Helper function to clean and normalize content
export function normalizeContent(content: any): any {
  if (Array.isArray(content)) {
    return content.map(item => ({
      ...item,
      question: item.question.trim(),
      ...(item.answer && { answer: item.answer.trim() }),
      ...(item.options && {
        options: item.options.map((opt: string) => opt.trim())
      }),
      ...(item.correctAnswer || item.options[0] && { correctAnswer: item.correctAnswer.trim() }),
      topic: item.topic.trim().toLowerCase(),
      ...(item.explanation && { explanation: item.explanation.trim() }),
      ...(item.additionalNotes && { additionalNotes: item.additionalNotes.trim() })
    }));
  }
  return content;
}
