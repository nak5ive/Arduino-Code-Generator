
import { GeneratedFile } from '../types';

export function createAndDownloadZip(files: GeneratedFile[], projectName: string): void {
  try {
    const zip = new JSZip();
    
    // Create a folder inside the zip file with the project name
    const folder = zip.folder(projectName);
    
    if (!folder) {
        throw new Error("Could not create folder in zip archive.");
    }

    files.forEach(file => {
      folder.file(file.filename, file.content);
    });

    zip.generateAsync({ type: "blob" })
      .then(function(content) {
        saveAs(content, `${projectName}.zip`);
      });
  } catch (error) {
    console.error("Failed to create ZIP file:", error);
    alert("An error occurred while creating the ZIP file. Please check the console for details.");
  }
}
