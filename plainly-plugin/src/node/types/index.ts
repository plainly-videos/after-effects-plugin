export interface ProjectInfo {
  fonts: Fonts[];
  footage: Footage[];
}

export interface Fonts {
  fontName: string;
  fontExtension: string;
  fontLocation: string;
}

export interface Footage {
  itemId: number;
  itemName: string;
  itemFsPath: string;
  itemAeFolder: string;
  isMissing: boolean;
}

export interface Settings {
  apiKey?: {
    key: string;
    encrypted: boolean;
  };
}

export interface RelinkData {
  [itemId: string]: string;
}
