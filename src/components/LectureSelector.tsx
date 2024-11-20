import { useState, useEffect } from 'react';

interface Lecture {
  id: string;
  title: string;
}

interface LectureSelectorProps {
  onSelect: (lectureId: string) => void;
  selectedId?: string;
}

export default function LectureSelector({ onSelect, selectedId }: LectureSelectorProps) {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const response = await fetch('/api/lectures');
        if (!response.ok) {
          throw new Error('Failed to fetch lectures');
        }
        const data = await response.json();
        setLectures(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch lectures');
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="h-10 w-full bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <select
      className="w-full p-2 border rounded-lg"
      value={selectedId || ''}
      onChange={(e) => onSelect(e.target.value)}
    >
      <option value="">Select a lecture...</option>
      {lectures.map((lecture) => (
        <option key={lecture.id} value={lecture.id}>
          {lecture.title}
        </option>
      ))}
    </select>
  );
}
