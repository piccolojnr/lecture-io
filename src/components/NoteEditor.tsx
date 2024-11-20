import { useState } from "react";
import ReactMarkdown from "react-markdown";
// import io from "socket.io-client";
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

interface NoteEditorProps {
  lectureId: string;
  initialNote?: Note;
}

export default function NoteEditor({
  lectureId,
  initialNote,
}: NoteEditorProps) {
  const [note, setNote] = useState<Note>({
    id: initialNote?.id || "",
    title: initialNote?.title || "Untitled Note",
    content: initialNote?.content || "",
    lectureId,
    lastModified: initialNote?.lastModified || new Date(),
  });
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // const [socket, setSocket] = useState<any>(null);

  // useEffect(() => {
  //   const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "", {
  //     query: { lectureId },
  //   });

  //   newSocket.on("note-update", (updatedNote: Note) => {
  //     if (updatedNote.id === note.id) {
  //       setNote(updatedNote);
  //     }
  //   });

  //   setSocket(newSocket);

  //   return () => {
  //     newSocket.close();
  //   };
  // }, [lectureId, note.id]);

  const saveNote = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/notes", {
        method: note.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });

      const savedNote = await response.json();
      setNote(savedNote);

      // if (socket) {
      //   socket.emit("note-change", savedNote);
      // }
    } catch (error) {
      console.error("Failed to save note:", error);
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

      <div className="flex-1 p-4">
        {isPreview ? (
          <div className="prose max-w-none">
            <ReactMarkdown>{note.content}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={note.content}
            onChange={(e) => setNote({ ...note, content: e.target.value })}
            className="w-full h-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Start writing your notes here... (Markdown supported)"
          />
        )}
      </div>
    </div>
  );
}
