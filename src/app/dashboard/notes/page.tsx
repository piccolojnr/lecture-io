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

interface Lecture {
  id: string;
  title: string;
}

export default function NotesPage() {
  const { data: session, status } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      redirect("/auth/signin");
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch notes
        const notesResponse = await fetch("/api/notes");
        if (!notesResponse.ok) throw new Error("Failed to fetch notes");
        const notesData = await notesResponse.json();

        // Fetch lectures
        const lecturesResponse = await fetch("/api/lectures");
        if (!lecturesResponse.ok) throw new Error("Failed to fetch lectures");
        const lecturesData = await lecturesResponse.json();

        setNotes(notesData);
        setLectures(lecturesData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load data. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Notes List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                My Notes
              </h2>
              {notes.length === 0 ? (
                <p className="text-gray-500 text-center">No notes found.</p>
              ) : (
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
                      <h3 className="font-medium text-gray-900">
                        {note.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {note.lastModified
                          ? note.lastModified.toLocaleDateString()
                          : "Unknown date"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Note Editor */}
          <div className="lg:col-span-3">
            <NoteEditor
              lectureId={selectedNote?.lectureId || ""}
              selectedNote={selectedNote}
              lectures={lectures}
              onSave={(updatedNote) => {
                setNotes((prevNotes) =>
                  updatedNote.id
                    ? prevNotes.map((note) =>
                        note.id === updatedNote.id ? updatedNote : note
                      )
                    : [updatedNote, ...prevNotes]
                );
                setSelectedNote(updatedNote);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
