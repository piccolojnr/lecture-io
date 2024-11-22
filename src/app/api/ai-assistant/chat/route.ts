import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { prisma } from "@/lib/prisma";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set in environment variables.");
}

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

    // Retrieve the chat session
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

    // Prepare context for AI from the last 5 messages
    const messages = chatSession.messages as any[];
    const context = messages
      .slice(-5)
      .map((m) => ({ role: m.role, content: m.content }));

    // Add the user's current message to the context
    context.push({ role: "user", content: message });

    // Call Groq API for AI response
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: "You are a helpful educational content generator." },
          ...context,
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("Groq API Error:", await response.text());
      return NextResponse.json(
        { error: "Failed to generate AI response. Please try again." },
        { status: 503 }
      );
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      return NextResponse.json(
        { error: "No response generated from AI" },
        { status: 503 }
      );
    }

    // Update chat session with new messages
    const updatedMessages = [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: assistantMessage },
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
      response: assistantMessage,
      messages: updatedMessages,
    });
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
