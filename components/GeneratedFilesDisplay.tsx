import React, { useState, useEffect, useMemo } from 'react';
import { GeneratedFile } from '../types';
import { CopyIcon, CheckIcon } from './Icons';

interface GeneratedFilesDisplayProps {
  files: GeneratedFile[];
}

const GeneratedFilesDisplay: React.FC<GeneratedFilesDisplayProps> = ({ files }) => {
  const [activeFile, setActiveFile] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

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
  
  // Reset copied state when the active file changes
  useEffect(() => {
    setIsCopied(false);
  }, [activeFile]);

  const selectedFile = files.find(f => f.filename === activeFile);

  const languageClass = useMemo(() => {
    if (!activeFile) return 'language-none';
    const extension = activeFile.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'ino':
      case 'cpp':
      case 'h':
        return 'language-cpp';
      case 'txt':
        return 'language-plaintext';
      default:
        return 'language-none';
    }
  }, [activeFile]);

  useEffect(() => {
    // When the selected file changes, re-run Prism's highlighting.
    // Prism is loaded from a CDN, so we check if it's on the window object.
    if (selectedFile && window.Prism) {
      // Use a short timeout to ensure React has rendered the new content first.
      setTimeout(() => window.Prism.highlightAll(), 0);
    }
  }, [selectedFile]);

  const handleCopy = () => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      }).catch(err => {
        console.error('Failed to copy code: ', err);
        // You could add user-facing error handling here
      });
    }
  };

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
      <div className="flex-grow overflow-auto bg-gray-900/70 relative">
        {selectedFile && (
           <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-2 bg-gray-700/80 backdrop-blur-sm hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-md text-xs transition-all duration-200 z-10"
            aria-label="Copy code to clipboard"
          >
            {isCopied ? (
              <>
                <CheckIcon className="w-4 h-4 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <CopyIcon className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        )}
        {/*
          Prism's theme provides styling for the <pre> tag.
          We override some styles for better integration:
          - !bg-transparent: Use parent's background.
          - !m-0: Remove default margins.
          - !p-4: Set consistent padding.
          The `key` attribute helps ensure React handles element updates correctly.
        */}
        <pre key={activeFile} className={`${languageClass} !bg-transparent !m-0 !p-4 h-full text-sm`}>
          <code className={`${languageClass} font-mono`}>
            {selectedFile ? selectedFile.content : 'No file selected.'}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default GeneratedFilesDisplay;