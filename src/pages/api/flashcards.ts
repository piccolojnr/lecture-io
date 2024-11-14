import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        try {
            const flashcards = req.body;

            const createdFlashcards = await Promise.all(
                flashcards.map(async (flashcard: any) => {
                    return prisma.flashcard.create({
                        data: {
                            question: flashcard.question,
                            answer: flashcard.answer,
                            confidence: flashcard.confidence,
                            lastReviewed: flashcard.lastReviewed,
                            lectureId: flashcard.lectureId,
                        },
                    });
                })
            );

            res.status(200).json(createdFlashcards);
        } catch (error) {
            console.error('Error creating flashcards:', error);
            res.status(500).json({ error: 'Failed to create flashcards' });
        }
    }
    else if (req.method === 'GET') {
        try {
            const { page = 1, pageSize = 10, lectureId } = req.query;
            const skip = (Number(page) - 1) * Number(pageSize);
            const take = Number(pageSize);

            const where = lectureId ? { lectureId: String(lectureId) } : {};

            const [flashcards, totalItems] = await Promise.all([
                prisma.flashcard.findMany({
                    where,
                    skip,
                    take,
                    orderBy: {
                        lastReviewed: 'asc'
                    },
                }),
                prisma.flashcard.count({ where })
            ]);

            const totalPages = Math.ceil(totalItems / take);

            res.status(200).json({
                data: flashcards,
                totalItems,
                totalPages,
                currentPage: Number(page),
                pageSize: Number(pageSize),
            });
        } catch (error) {
            console.error('Error fetching flashcards:', error);
            res.status(500).json({ error: 'Failed to fetch flashcards' });
        }
    }
    else if (req.method === 'PATCH') {
        try {
            const { id, confidence } = req.body;

            const updatedFlashcard = await prisma.flashcard.update({
                where: { id },
                data: {
                    confidence,
                    lastReviewed: new Date(),
                },
            });

            res.status(200).json(updatedFlashcard);
        } catch (error) {
            console.error('Error updating flashcard:', error);
            res.status(500).json({ error: 'Failed to update flashcard' });
        }
    }
    else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 