"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import NoteEditor from "@/components/NoteEditor";
import { useState, useEffect } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
  lectureId: string;
  lastModified: Date;
}

export default function NotesPage() {
  const { data: session, status } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      redirect("/auth/signin");
    }

    // Fetch user's notes
    const fetchNotes = async () => {
      try {
        const response = await fetch("/api/notes");
        const data = await response.json();
        setNotes(data);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      }
    };

    fetchNotes();
  }, [session, status]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
        <button
          onClick={() => setSelectedNote(null)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          New Note
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Notes List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Notes</h2>
            <div className="space-y-2">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`w-full text-left p-3 rounded-lg ${
                    selectedNote?.id === note.id
                      ? "bg-indigo-50 border-indigo-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{note.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(note.lastModified).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Note Editor */}
        <div className="lg:col-span-3">
          <NoteEditor
            lectureId={selectedNote?.lectureId || ""}
            initialNote={selectedNote || undefined}
          />
        </div>
      </div>
    </div>
  );
}
