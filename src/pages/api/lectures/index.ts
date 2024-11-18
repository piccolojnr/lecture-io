import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        try {
            const { title } = req.body;
            const createdLectures = await prisma.lecture.create({
                data: {
                    title,
                },
            });

            res.status(200).json(createdLectures);
        } catch (error) {
            console.error('Error creating lectures:', error);
            res.status(500).json({ error: 'Failed to create lectures' });
        }
    }
    else if (req.method === 'GET') {
        try {

            const lectures = await prisma.lecture.findMany({
                include: {
                    _count: {
                        select: { flashcards: true },
                    },
                },
            });

            const formatedLectures = await Promise.all(
                lectures.map(async (lecture) => ({
                    id: lecture.id,
                    title: lecture.title,
                    flashcardsCount: lecture._count.flashcards,
                    topicsCount: await prisma.topic.count({
                        where: {
                            flashcards: {
                                some: {
                                    lectureId: {
                                        equals: lecture.id,
                                    },
                                },
                            },
                        },
                    }),
                }))
            );

            res.status(200).json(formatedLectures);
        } catch (error) {
            console.error('Error fetching lectures:', error);
            res.status(500).json({ error: 'Failed to fetch lectures' });
        }
    }
    else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 