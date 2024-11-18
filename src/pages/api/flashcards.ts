import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        try {
            if (!req.body || typeof req.body !== 'object') {
                return res.status(400).json({ error: 'Request body must be an object' });
            }

            const { flashcards, lectureId } = req.body;

            const lectureIdInt = parseInt(lectureId, 10);
            if (isNaN(lectureIdInt)) {
                return res.status(400).json({ error: 'Invalid lectureId, it must be a number.' });
            }

            if (!flashcards || !lectureId) {
                return res.status(400).json({ error: 'Missing required fields' });
            }



            const data = [];
            for (const flashcard of flashcards) {
                const { question, answer, topic, additionalNotes } = flashcard;

                if (!question || !answer || !topic) {
                    return res.status(400).json({ error: "Each flashcard must have a question, answer, and topic." });
                }
                // Create or connect to the Topic
                const topicRecord = await prisma.topic.upsert({
                    where: { name: topic },
                    update: {},
                    create: { name: topic },
                });

                data.push({
                    lectureId: lectureIdInt,
                    question,
                    answer,
                    additionalNotes: additionalNotes ?? "",
                    topicId: topicRecord.id,
                    confidence: 0,
                });
            }
            await prisma.flashcard.createMany({
                data
            });



            res.status(200).json({ message: "Flashcards uploaded successfully.", data });
        } catch (error) {
            console.error("Error uploading flashcards:", error);
            res.status(500).json({ error: "Error uploading flashcards." });
        }
    }
    else if (req.method === 'GET') {
        try {
            const { lectureId, topicId } = req.query;

            const lectureIdInt = parseInt(lectureId as string, 10);
            if (isNaN(lectureIdInt)) {
                return res.status(400).json({ error: 'Invalid lectureId, it must be a number.' });
            }

            const topicIdInt = parseInt(topicId as string, 10);
            if (topicId && isNaN(topicIdInt)) {
                return res.status(400).json({ error: 'Invalid topicId, it must be a number.' });
            }

            let where: any = {
                lectureId: parseInt(lectureId as string),
            };

            if (topicId) {
                where = {
                    lectureId: parseInt(lectureId as string),
                    topicId: parseInt(topicId as string)
                };
            }


            const flashcards = await prisma.flashcard.findMany({
                where,
                include: {
                    Topic: true,
                    Lecture: true,
                },
            });
            const uniqueTopics = await prisma.topic.findMany({
                where: {
                    flashcards: {
                        some: {
                            lectureId: parseInt(lectureId as string),
                        },
                    },
                },
                select: {
                    name: true,
                    id: true,
                },
                distinct: ['name'],
            });


            const topicsWithCompletion = await Promise.all(uniqueTopics.map(async (topic) => {
                const topicFlashcards = await prisma.flashcard.findMany({
                    where: {
                        lectureId: parseInt(lectureId as string),
                        topicId: topic.id,
                    },
                });

                const totalFlashcards = topicFlashcards.length;

                const valueOfEachFlashcard = 100 / totalFlashcards;

                const percentageCompleted = topicFlashcards.reduce((acc, flashcard) => {
                    return acc + (flashcard.confidence / 5) * valueOfEachFlashcard;
                }, 0);
                const roundedPercentage = Math.round(percentageCompleted);

                const finalData = {
                    name: topic.name,
                    id: topic.id,
                    percentageCompleted: roundedPercentage,
                };
                return finalData;
            }));

            const percentageCompleted = topicsWithCompletion.reduce((acc, topic) => acc + topic.percentageCompleted, 0) / topicsWithCompletion.length

            const mostRecentlyViewedFlashcard = await prisma.flashcard.findFirst({
                where,
                orderBy: {
                    lastReviewed: 'desc',
                },
            });



            res.status(200).json({
                data: flashcards,
                topics: topicsWithCompletion,
                percentageCompleted,
                mostRecentlyViewedFlashcard

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