interface Footage {
  itemId: number;
  itemName: string;
  itemFsPath: string;
  itemAeFolder: string;
  isMissing: boolean;
}

interface Font {
  postScriptName: string;
  fontLocation: string;
  fontFamily: string;
  fontStyle: string;
}

interface ProjectInfo {
  fonts: Font[];
  footage: Footage[];
}

export type { Footage, Font, ProjectInfo };
