
import React, { useState, useCallback } from 'react';
import { GeneratedProject, GeneratedFile } from './types';
import { generateArduinoProject } from './services/geminiService';
import { createAndDownloadZip } from './utils/zipUtils';
import Button from './components/Button';
import Loader from './components/Loader';
import GeneratedFilesDisplay from './components/GeneratedFilesDisplay';
import { CodeIcon, ZapIcon } from './components/Icons';

export default function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedProject, setGeneratedProject] = useState<GeneratedProject | null>(null);
  const [generationPrompt, setGenerationPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your Arduino project.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedProject(null);
    setGenerationPrompt('');

    try {
      const result = await generateArduinoProject(prompt);
      if (result && result.files && result.files.length > 0) {
        setGeneratedProject(result);
        setGenerationPrompt(prompt);
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

      <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-semibold text-gray-100">1. Describe Your Project</h2>
          <div className="bg-gray-800 rounded-lg border border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-300">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholderText}
              className="w-full h-96 bg-transparent text-gray-300 p-4 rounded-lg focus:outline-none resize-none placeholder:text-gray-500 font-mono text-sm leading-relaxed"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className="w-full"
          >
            {isLoading ? 'Generating...' : (
              <>
                <ZapIcon className="w-5 h-5 mr-2" />
                Generate Project
              </>
            )}
          </Button>
        </div>

        {/* Output Section */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-semibold text-gray-100">2. Generated Code</h2>
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
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <Button onClick={handleDownload} className="w-full">
                    Download {generatedProject.projectName}.zip
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
