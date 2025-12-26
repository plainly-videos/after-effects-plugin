interface Footage {
  itemId: number;
  itemName: string;
  itemFsPath: string;
  itemAeFolder: string;
  isMissing: boolean;
}

interface Font {
  fontName: string;
  fontExtension: string | undefined;
  fontLocation: string;
}

interface ProjectInfo {
  fonts: Font[];
  footage: Footage[];
}

export type { Footage, Font, ProjectInfo };
