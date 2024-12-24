export interface ProjectInfo {
  projectPath: string;
  fonts: Fonts[];
  footage: Footage[];
}

export interface Fonts {
  fontName: string;
  fontExtension: string;
  fontLocation: string;
}

export interface Footage {
  itemName: string;
  itemFolder: string;
}

export interface CollectFilesResult {
  collectFilesDir: string;
  projectName: string;
}

export interface Settings {
  apiKey?: {
    key: string;
    encrypted: boolean;
  };
}
