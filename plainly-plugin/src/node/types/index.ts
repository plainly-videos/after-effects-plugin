export interface ProjectInfo {
  fonts: Fonts[];
  footage: Footage[];
  textLayerIssues: TextLayerIssue[];
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

export interface TextLayerIssue {
  name: string;
  type: 'allCaps';
}

export interface Issues {
  allCaps: TextLayerIssue[];
}

export interface Settings {
  apiKey?: {
    key: string;
    encrypted: boolean;
  };
}
