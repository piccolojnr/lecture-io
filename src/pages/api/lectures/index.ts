import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Lecture } from '@/types';

const prisma = new PrismaClient();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        try {
            const lectures: Lecture[] = req.body;


            const createdLectures = await Promise.all(
                lectures.map(async (lecture) => {
                    return prisma.lecture.create({
                        data: {
                            title: lecture.title,
                            content: lecture.content,
                            topics: {
                                create: lecture.topics.map((topic) => ({
                                    title: topic.title,
                                    keyPoints: {
                                        create: topic.keyPoints.map((keyPoint) => ({
                                            content: keyPoint,
                                        })),
                                    },
                                })),
                            },
                            slides: {
                                create: lecture.slides.map((slide) => ({
                                    content: slide.content,
                                })),
                            },
                        },
                    });
                })
            );

            res.status(200).json(createdLectures);
        } catch (error) {
            console.error('Error creating lectures:', error);
            res.status(500).json({ error: 'Failed to create lectures' });
        }
    }
    else if (req.method === 'GET') {
        try {
            const { page = 1, pageSize = 10 } = req.query;
            const skip = (Number(page) - 1) * Number(pageSize);
            const take = Number(pageSize);

            const data = await prisma.lecture.findMany({
                skip,
                take,
            });

            const totalItems = await prisma.lecture.count();
            const totalPages = Math.ceil(totalItems / take);

            res.status(200).json({
                data: data,
                pagination: {
                    totalItems,
                    totalPages,
                    currentPage: Number(page),
                    pageSize: Number(pageSize),
                },
            });
        } catch (error) {
            console.error('Error fetching lectures:', error);
            res.status(500).json({ error: 'Failed to fetch lectures' });
        }
    }
    else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 