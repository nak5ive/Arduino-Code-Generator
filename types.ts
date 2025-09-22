// Declaring global types for libraries loaded from CDN
// FIX: Wrapped JSZip and saveAs declarations in `declare global` to correctly
// augment the global scope from within this module, resolving "Cannot find name" errors.
declare global {
  var JSZip: any;
  var saveAs: (blob: Blob, filename: string) => void;
}

export interface GeneratedFile {
  filename: string;
  content: string;
}

export interface GeneratedProject {
  projectName: string;
  files: GeneratedFile[];
}
