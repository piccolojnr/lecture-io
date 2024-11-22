import { NextResponse } from "next/server";
import { processChunkWithAI } from "@/lib/ai-generator-lib";

export async function POST(req: Request) {
    try {
        const { failedChunks, apiKey, type, chunks } = await req.json();

        if (!failedChunks || !Array.isArray(failedChunks) || !apiKey || !type || !chunks) {
            return NextResponse.json(
                { error: "Missing or invalid required fields" },
                { status: 400 }
            );
        }

        const results: any[] = [];
        const remainingFailedChunks: number[] = [];

        for (const i of failedChunks) {
            try {
                const result = await processChunkWithAI(chunks[i], type, apiKey);
                results.push(...result);
            } catch (error) {
                console.error(`Failed to process chunk ${i} during retry:`, error);
                remainingFailedChunks.push(i);
            }
        }

        return NextResponse.json({
            success: remainingFailedChunks.length === 0,
            results,
            failedChunks: remainingFailedChunks,
            totalChunks: chunks.length,
        });
    } catch (error) {
        console.error("Error in retry route:", error);
        return NextResponse.json(
            { error: "Failed to retry processing chunks" },
            { status: 500 }
        );
    }
}
