'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface ContentGeneratorProps {
  extractedText: string;
  lectureId?: string;
}

export function ContentGenerator({ extractedText, lectureId }: ContentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentType, setContentType] = useState<'quiz' | 'flashcard'>('quiz');
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const generateContent = async () => {
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      toast.error('Missing API key. Please set NEXT_PUBLIC_GROQ_API_KEY in your environment.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: extractedText,
          type: contentType,
          apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
          lectureId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      
      if (data.failedChunks.length > 0) {
        toast.warning(`Generation partially completed. ${data.failedChunks.length} chunks failed.`);
      } else {
        toast.success('Content generated successfully!');
      }

      // TODO: Save the generated content to the database
      console.log('Generated content:', data.results);

    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value as 'quiz' | 'flashcard')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          disabled={isGenerating}
        >
          <option value="quiz">Generate Quiz</option>
          <option value="flashcard">Generate Flashcards</option>
        </select>

        <button
          onClick={generateContent}
          disabled={isGenerating || !extractedText}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Content'
          )}
        </button>
      </div>

      {isGenerating && progress.total > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${(progress.current / progress.total) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
