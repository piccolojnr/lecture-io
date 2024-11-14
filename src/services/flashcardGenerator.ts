import { Lecture, Flashcard } from '../types';

export class FlashcardGenerator {
    static generateFromLecture(lecture: Lecture): Flashcard[] {
        const flashcards: Flashcard[] = [];

        // Generate from topics and their key points
        lecture.topics.forEach(topic => {
            // Create a flashcard for the topic overview
            flashcards.push({
                id: `flashcard-${Math.random().toString(36).substr(2, 9)}`,
                lectureId: lecture.id,
                question: `What is the main concept of ${topic.title}?`,
                answer: topic.title,
                confidence: 1,
                lastReviewed: new Date()
            });

            // Create flashcards from key points
            topic.keyPoints.forEach(keyPoint => {
                flashcards.push({
                    id: `flashcard-${Math.random().toString(36).substr(2, 9)}`,
                    lectureId: lecture.id,
                    question: this.generateQuestion(keyPoint.content, topic.title),
                    answer: keyPoint.content,
                    confidence: 1,
                    lastReviewed: new Date()
                });
            });
        });

        // Generate from slides content
        lecture.slides.forEach(slide => {
            const keyPoints = this.extractKeyPoints(slide.content);
            keyPoints.forEach(point => {
                if (this.isValidFlashcardContent(point)) {
                    flashcards.push(this.createFlashcardFromPoint(point, lecture.id || ''));
                }
            });
        });

        return flashcards;
    }

    private static generateQuestion(content: string, context: string): string {
        if (content.includes('?')) {
            return content;
        }

        // Check if it's a definition
        if (content.includes(':')) {
            const [term] = content.split(':');
            return `What is ${term.trim()}?`;
        }

        // Generate contextual question
        return `In the context of ${context}, explain: ${content}`;
    }

    private static extractKeyPoints(content: string): string[] {
        return content
            .split('\n')
            .filter(line =>
                line.trim().match(/^[•\-\*\d.]/) || // Bullet points or numbered lists
                line.includes(':') || // Definitions
                line.includes('?')    // Questions
            )
            .map(line => line.replace(/^[•\-\*\d.]\s*/, '').trim());
    }

    private static isValidFlashcardContent(content: string): boolean {
        return (
            content.length >= 10 && // Minimum length
            content.length <= 500 && // Maximum length
            !content.includes('http') && // No URLs
            (
                content.includes('?') || // Questions
                content.includes(':') || // Definitions
                /[A-Z].*[.!?]$/.test(content) // Complete sentences
            )
        );
    }

    private static createFlashcardFromPoint(point: string, lectureId: string): Flashcard {
        let question: string;
        let answer: string;

        if (point.includes('?')) {
            // It's already a question
            const parts = point.split(/\s*-\s*|\s*:\s*/);
            question = parts[0].trim();
            answer = parts.length > 1 ? parts[1].trim() : '';
        } else if (point.includes(':')) {
            // It's a definition
            const [term, definition] = point.split(':');
            question = `What is ${term.trim()}?`;
            answer = definition.trim();
        } else {
            // Create a general knowledge question
            question = `Explain the following concept: ${point}`;
            answer = point;
        }

        return {
            id: `flashcard-${Math.random().toString(36).substr(2, 9)}`,
            lectureId,
            question,
            answer,
            confidence: 1,
            lastReviewed: new Date()
        };
    }
} 