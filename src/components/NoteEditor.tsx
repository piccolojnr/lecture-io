import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import PreviewIcon from "./icons/PreviewIcon";
import EditIcon from "./icons/EditIcon";
import SaveIcon from "./icons/SaveIcon";

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

interface NoteEditorProps {
  lectureId: string;
  lectures: Lecture[];
  selectedNote?: Note | null;
  onSave: (note: Note) => void;
}

export default function NoteEditor({
  lectureId,
  lectures,
  selectedNote,
  onSave,
}: NoteEditorProps) {
  const [note, setNote] = useState<Note>({
    id: "",
    title: "Untitled Note",
    content: "",
    lectureId,
    lastModified: new Date(),
  });
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedNote) {
      setNote(selectedNote);
    } else {
      setNote({
        id: "",
        title: "Untitled Note",
        content: "",
        lectureId,
        lastModified: new Date(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNote]);

  const saveNote = async () => {
    if (!note.title.trim() || !note.content.trim()) {
      setError("Title and content cannot be empty.");
      return;
    }

    if (!note.lectureId) {
      setError("Please select a lecture.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/notes", {
        method: note.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });

      if (!response.ok) {
        throw new Error("Failed to save note");
      }

      const savedNote = await response.json();
      setNote(savedNote);
      onSave(savedNote);
    } catch (err) {
      console.error("Failed to save note:", err);
      setError("Failed to save the note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b flex items-center justify-between">
        <input
          type="text"
          value={note.title}
          onChange={(e) => setNote({ ...note, title: e.target.value })}
          className="text-xl font-semibold bg-transparent border-none focus:outline-none w-0 flex-1"
          placeholder="Note Title"
        />
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {isPreview ? (
              <EditIcon className="w-6 h-6 text-gray-600" aria-hidden="true" />
            ) : (
              <PreviewIcon
                className="w-6 h-6 text-gray-600"
                aria-hidden="true"
              />
            )}
          </button>
          <button
            onClick={saveNote}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <SaveIcon className="w-6 h-6 text-white" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 text-red-500 text-sm">
          <p>{error}</p>
        </div>
      )}

      <div className="p-4">
        {!selectedNote && (
          <select
            value={note.lectureId}
            onChange={(e) => setNote({ ...note, lectureId: e.target.value })}
            className="w-full mb-4 p-2 border rounded-lg"
          >
            <option value="">Select a lecture</option>
            {lectures.map((lecture) => (
              <option key={lecture.id} value={lecture.id}>
                {lecture.title}
              </option>
            ))}
          </select>
        )}

        {isPreview ? (
          <div className="prose max-w-none">
            <ReactMarkdown>{note.content}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={note.content}
            onChange={(e) => setNote({ ...note, content: e.target.value })}
            className="w-full h-[400px] p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Start writing your notes here... (Markdown supported)"
          />
        )}
      </div>
    </div>
  );
}
