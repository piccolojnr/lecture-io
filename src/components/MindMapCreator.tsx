import { useState } from 'react';
import MindMap from './MindMap';
import LectureSelector from './LectureSelector';

export default function MindMapCreator() {
  const [selectedLecture, setSelectedLecture] = useState<string>('');
  const [title, setTitle] = useState('');

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mind Map Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter mind map title..."
            className="w-full p-2 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Lecture
          </label>
          <LectureSelector
            selectedId={selectedLecture}
            onSelect={setSelectedLecture}
          />
        </div>
      </div>

      {selectedLecture && (
        <MindMap
          lectureId={selectedLecture}
          title={title || 'Untitled Mind Map'}
        />
      )}
    </div>
  );
}
