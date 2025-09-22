
import React, { useState, useEffect } from 'react';
import { GeneratedFile } from '../types';

interface GeneratedFilesDisplayProps {
  files: GeneratedFile[];
}

const GeneratedFilesDisplay: React.FC<GeneratedFilesDisplayProps> = ({ files }) => {
  const [activeFile, setActiveFile] = useState<string>(files.length > 0 ? files[0].filename : '');

  useEffect(() => {
    // Reset active file if files array changes
    if (files.length > 0) {
      const mainInoFile = files.find(f => f.filename.endsWith('.ino'));
      setActiveFile(mainInoFile ? mainInoFile.filename : files[0].filename);
    } else {
      setActiveFile('');
    }
  }, [files]);
  
  const selectedFile = files.find(f => f.filename === activeFile);

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg overflow-hidden">
      <div className="flex-shrink-0 bg-gray-900/50 border-b border-gray-700">
        <div className="flex space-x-1 p-1 overflow-x-auto">
          {files.map((file) => (
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
