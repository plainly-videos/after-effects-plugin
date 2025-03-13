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
  itemName: string;
  itemFolder: string;
}

export interface Settings {
  apiKey?: {
    key: string;
    encrypted: boolean;
  };
  showUpdate?: boolean;
}
