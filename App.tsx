
import React, { useState, useCallback } from 'react';
import { GeneratedProject, GeneratedFile } from './types';
import { generateArduinoProject } from './services/geminiService';
import { createAndDownloadZip } from './utils/zipUtils';
import Button from './components/Button';
import Loader from './components/Loader';
import GeneratedFilesDisplay from './components/GeneratedFilesDisplay';
import { CodeIcon, ZapIcon, DownloadIcon } from './components/Icons';

export default function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [generatedProject, setGeneratedProject] = useState<GeneratedProject | null>(null);
  const [generationPrompt, setGenerationPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError('Please enter a description for your Arduino project.');
      return;
    }

    // Add to history: prepend new prompt and remove any old duplicates
    setPromptHistory(prev => [trimmedPrompt, ...prev.filter(p => p !== trimmedPrompt)]);

    setIsLoading(true);
    setError(null);
    setGeneratedProject(null);
    setGenerationPrompt('');

    try {
      const result = await generateArduinoProject(trimmedPrompt);
      if (result && result.files && result.files.length > 0) {
        setGeneratedProject(result);
        setGenerationPrompt(trimmedPrompt);
      } else {
        setError('The model did not return any files. Please try refining your prompt.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please check the console.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const handleDownload = () => {
    if (generatedProject && generationPrompt) {
      createAndDownloadZip(generatedProject.files, generatedProject.projectName, generationPrompt);
    }
  };

  const handleHistoryClick = (historicalPrompt: string) => {
    setPrompt(historicalPrompt);
  };
  
  const placeholderText = `Describe your Arduino project here. For example:

A simple project using the built-in LED:
"Blink the built-in LED on an Arduino Uno. On for 200ms, off for 800ms. Use a separate C++ class 'LedManager' to handle the logic."

A project with external components that needs a wiring diagram:
"Design a traffic light with red, yellow, and green LEDs on pins 9, 10, and 11. Sequence: Green for 5s, Yellow for 2s, Red for 5s, and repeat."`;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-blue-500/30 p-4 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CodeIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Arduino Code <span className="text-blue-400">Generator</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Input Section */}
        <div className="flex flex-col lg:col-span-1">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-100">Describe Your Project</h2>
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !prompt}
                className="px-3 py-1.5 text-xs gap-2"
              >
                {isLoading ? 'Generating...' : (
                  <>
                    <ZapIcon className="w-4 h-4" />
                    <span>Generate</span>
                  </>
                )}
              </Button>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-300">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={placeholderText}
                className="w-full h-96 bg-transparent text-gray-300 p-4 rounded-lg focus:outline-none resize-none placeholder:text-gray-500 font-mono text-sm leading-relaxed"
                disabled={isLoading}
              />
            </div>
          </div>

          {promptHistory.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-300 mb-3">Recent Prompts</h3>
              <div className="flex flex-col space-y-2">
                {promptHistory.slice(0, 5).map((histPrompt, index) => ( // Show last 5 prompts
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(histPrompt)}
                    className="text-left p-3 bg-gray-800/50 hover:bg-gray-700/70 rounded-md transition-colors duration-200 cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title={histPrompt} // Show full prompt on hover
                  >
                    <p className="text-sm text-gray-400 truncate">
                      {histPrompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="flex flex-col space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-100">Generated Code</h2>
            <Button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs gap-2"
              disabled={!generatedProject}
              aria-label={generatedProject ? `Download ${generatedProject.projectName}.zip` : "Download project zip"}
            >
              <DownloadIcon className="w-4 h-4" />
              <span>
                {generatedProject
                  ? `${generatedProject.projectName}.zip`
                  : 'project.zip'}
              </span>
            </Button>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 min-h-[510px] flex flex-col p-4">
            {isLoading && <Loader />}
            {error && (
              <div className="m-auto text-center text-red-400">
                <p className="font-semibold">Generation Failed</p>
                <p className="text-sm mt-2">{error}</p>
              </div>
            )}
            {!isLoading && !error && !generatedProject && (
               <div className="m-auto text-center text-gray-500">
                <CodeIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Your generated Arduino project files</p>
                <p>will appear here.</p>
              </div>
            )}
            {generatedProject && (
              <div className="flex flex-col h-full">
                <GeneratedFilesDisplay files={generatedProject.files} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
