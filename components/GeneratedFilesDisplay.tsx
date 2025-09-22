
import React, { useState, useEffect, useMemo } from 'react';
import { GeneratedFile } from '../types';

interface GeneratedFilesDisplayProps {
  files: GeneratedFile[];
}

const GeneratedFilesDisplay: React.FC<GeneratedFilesDisplayProps> = ({ files }) => {
  const [activeFile, setActiveFile] = useState<string>('');

  const sortedFiles = useMemo(() => {
    const fileOrder = (filename: string): number => {
      if (filename.endsWith('.ino')) return 0;
      if (filename.toLowerCase() === 'wiring.txt') return 1;
      if (filename.endsWith('.h')) return 2;
      if (filename.endsWith('.cpp')) return 3;
      return 4;
    };

    return [...files].sort((a, b) => {
      const orderA = fileOrder(a.filename);
      const orderB = fileOrder(b.filename);
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.filename.localeCompare(b.filename);
    });
  }, [files]);

  useEffect(() => {
    // Set active file based on the first item in the sorted list
    if (sortedFiles.length > 0) {
      setActiveFile(sortedFiles[0].filename);
    } else {
      setActiveFile('');
    }
  }, [sortedFiles]);
  
  const selectedFile = files.find(f => f.filename === activeFile);

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg overflow-hidden">
      <div className="flex-shrink-0 bg-gray-900/50 border-b border-gray-700">
        <div className="flex space-x-1 p-1 overflow-x-auto">
          {sortedFiles.map((file) => (
            <button
              key={file.filename}
              onClick={() => setActiveFile(file.filename)}
              className={`
                px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap
                transition-colors duration-200
                ${
                  activeFile === file.filename
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              {file.filename}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-grow p-1 overflow-auto bg-gray-900/70">
        <pre className="text-sm leading-relaxed whitespace-pre-wrap p-3">
          <code className="font-mono text-gray-300">
            {selectedFile ? selectedFile.content : 'No file selected.'}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default GeneratedFilesDisplay;
