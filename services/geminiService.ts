
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedProject } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const projectSchema = {
  type: Type.OBJECT,
  properties: {
    projectName: {
      type: Type.STRING,
      description: "A short, descriptive, camelCase name for the project. This will be used for the main .ino file and the zip file name."
    },
    files: {
      type: Type.ARRAY,
      description: "An array of file objects representing the Arduino project.",
      items: {
        type: Type.OBJECT,
        properties: {
          filename: {
            type: Type.STRING,
            description: "The full name of the file, including the extension (e.g., 'projectName.ino', 'LedManager.h', 'LedManager.cpp'). The main file MUST match the projectName with a .ino extension."
          },
          content: {
            type: Type.STRING,
            description: "The complete, raw source code for the file as a single string."
          }
        },
        required: ["filename", "content"]
      }
    }
  },
  required: ["projectName", "files"]
};

export async function generateArduinoProject(prompt: string): Promise<GeneratedProject> {
  try {
    const systemInstruction = `You are an expert Arduino programmer and firmware engineer.
Your task is to generate a complete, multi-file Arduino project based on a user's natural language description.
The project must be well-structured, with a main '.ino' file and separate '.h' and '.cpp' files for classes or libraries where appropriate.
Ensure the code is clean, commented, and follows Arduino best practices.
The main .ino file must have the same name as the 'projectName'.
You must output a JSON object that strictly adheres to the provided schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: projectSchema,
      },
    });
    
    const jsonText = response.text.trim();
    
    // Sometimes the model wraps the JSON in markdown backticks
    const cleanedJsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    
    const parsedProject = JSON.parse(cleanedJsonText) as GeneratedProject;

    if (!parsedProject.projectName || !parsedProject.files || parsedProject.files.length === 0) {
        throw new Error("Invalid project structure returned by the model.");
    }
    
    return parsedProject;
  } catch (error) {
    console.error("Error generating Arduino project:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate code from AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI model.");
  }
}
