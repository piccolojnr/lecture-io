import { useState, useCallback, useRef, useEffect } from "react";
import { ChatSession, Message } from "@/types";

interface UseAIChatProps {
  initialSession?: ChatSession;
  onSessionCreate: () => Promise<ChatSession | null>;
}

interface UseAIChatReturn {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  retryLastMessage: () => void;
  session: ChatSession | null;
}

export function useAIChat({ initialSession, onSessionCreate }: UseAIChatProps): UseAIChatReturn {
  const [session, setSession] = useState<ChatSession | null>(initialSession || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load messages when session changes
  useEffect(() => {
    if (session?.messages) {
      setMessages(session.messages as Message[]);
    }
  }, [session]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    setError(null);
    let currentSession = session;

    if (!currentSession) {
      try {
        const newSession = await onSessionCreate();
        if (!newSession) {
          setError("Failed to create a new chat session. Please try again.");
          return;
        }
        currentSession = newSession;
        setSession(newSession);
      } catch (error: any) {
        console.error(error);
        setError("Failed to create a new chat session. Please try again.");
        return;
      }
    }

    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId: currentSession.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI response");
      }

      const data = await response.json();
      
      // Only update state if the component is still mounted
      if (isMounted.current) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      }
    } catch (error) {
      if (isMounted.current) {
        setError(
          error instanceof Error ? error.message : "Failed to get AI response"
        );
        // Remove the user's message if we couldn't get a response
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [session, onSessionCreate]);

  const retryLastMessage = useCallback(() => {
    setError(null);
    const lastUserMessage = messages.findLast((m) => m.role === "user");
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
      setMessages((prev) => prev.slice(0, -1));
    }
  }, [messages]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    retryLastMessage,
    session,
  };
}
