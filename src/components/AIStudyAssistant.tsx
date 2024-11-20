import { ChatSession, Lecture } from "@/types";
import { useEffect, useState } from "react";
import ErrorDisplay from "./ErrorDisplay";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  session?: ChatSession | null;
  lectures: Lecture[];
  onSessionCreate: () => Promise<ChatSession | null>;
}

export default function AIStudyAssistant({
  onSessionCreate,
  session,
  lectures,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lecture, setLecture] = useState<Lecture | null>(null);

  useEffect(() => {
    if (session) {
      setMessages(session.messages);
      setLecture(lectures.find((l) => l.id === session.lectureId) || null);
    }

    setError(null);
  }, [session, lectures]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setError(null);

    let _session = session;

    if (!_session) {
      try {
        _session = await onSessionCreate();
        if (!_session) {
          setError("Failed to create a new chat session. Please try again.");
          return;
        }
      } catch (error: any) {
        console.error(error);
        setError("Failed to create a new chat session. Please try again.");
        return;
      }
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, sessionId: _session.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI response");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to get AI response"
      );
      // Remove the user's message if we couldn't get a response
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const retryLastMessage = () => {
    setError(null);
    const lastUserMessage = messages.findLast((m) => m.role === "user");
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b">
        {lecture ? (
          <h2 className="text-lg font-semibold text-gray-900">
            Chatting about {lecture.title}
          </h2>
        ) : (
          <h2 className="text-lg font-semibold text-gray-900">
            Start a new chat session
          </h2>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">Thinking...</div>
          </div>
        )}
        {error && <ErrorDisplay message={error} retry={retryLastMessage} />}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your studies..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
