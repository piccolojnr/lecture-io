import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/utils/authOptions";
import { splitTextIntoChunks } from '@/lib/ai-generator-lib';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { text, } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const chunks = splitTextIntoChunks(text);

        return NextResponse.json({
            success: true,
            chunks,
            totalChunks: chunks.length
        });
    } catch (error) {
        console.error('Error in POST handler:', error);
        return NextResponse.json({ error: 'Failed to generate chunks' }, { status: 500 });
    }
}