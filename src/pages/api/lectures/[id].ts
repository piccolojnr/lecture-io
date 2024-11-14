// lectures/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    try {
        const lecture = await prisma.lecture.findUnique({
            where: { id: String(id) },
            include: {
                topics: {
                    include: {
                        keyPoints: true,
                    },
                },
                slides: true,
            },
        });

        if (!lecture) {
            return res.status(404).json({ error: 'Lecture not found' });
        }

        res.status(200).json(lecture);
    } catch (error) {
        console.error('Error fetching lecture:', error);
        res.status(500).json({ error: 'Failed to fetch lecture' });
    }
}
