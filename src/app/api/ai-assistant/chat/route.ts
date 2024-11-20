import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { HfInference } from "@huggingface/inference";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "Message and session ID are required" },
        { status: 400 }
      );
    }

    // Get the chat session and its messages
    const chatSession = await prisma.aIAssistantChat.findUnique({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    // Prepare context from previous messages
    const messages = chatSession.messages as any[];
    const context = messages
      .slice(-5) // Use last 5 messages for context
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    if (!process.env.HUGGINGFACE_API_KEY) {
      return NextResponse.json(
        { error: "AI service is not configured properly" },
        { status: 503 }
      );
    }

    // Generate AI response
    try {
      const aiResponse = await hf.textGeneration({
        model: "t5-large",
        inputs: `${context}\nUser: ${message}\nAssistant:`,
        parameters: {
          max_length: 200,
          temperature: 0.7,
        },
      });

      if (!aiResponse.generated_text) {
        throw new Error("No response generated");
      }

      // Update chat session with new messages
      const updatedMessages = [
        ...messages,
        { role: "user", content: message },
        { role: "assistant", content: aiResponse.generated_text },
      ];

      await prisma.aIAssistantChat.update({
        where: {
          id: sessionId,
        },
        data: {
          messages: updatedMessages,
        },
      });

      return NextResponse.json({
        response: aiResponse.generated_text,
        messages: updatedMessages,
      });
    } catch (error) {
      console.error("AI Generation Error:", error);
      return NextResponse.json(
        { error: "Failed to generate AI response. Please try again." },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
