export interface Lecture {
    id?: string;
    title: string;
    content?: string;
    slides: Slide[];
    topics: Topic[];
    progress: number;
    status: 'not_started' | 'in_progress' | 'understood' | 'review_needed';
}

export interface Slide {
    id?: string;
    content: string;
    notes?: string;
    imageUrl?: string;
}

export interface Topic {
    id?: string;
    title: string;
    keyPoints: KeyPoint[];
    status: 'understood' | 'review_needed' | 'not_started';
}

export interface KeyPoint {
    content: string
}

export interface Flashcard {
    id?: string;
    lectureId?: string;
    question: string;
    answer: string;
    lastReviewed?: Date;
    confidence: 1 | 2 | 3 | 4 | 5;
}

export interface Quiz {
    id: string;
    lectureId: string;
    questions: QuizQuestion[];
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
} 