interface InstalledFontData {
  isSubstitute: boolean;
  fontLocation: string;
}

interface SelectedLayerInfo {
  id: number;
  name: string;
  index: number;
  compId: number;
  compName: string;
  /** Set when the layer's source is a CompItem (precomp layer). */
  sourceCompId?: number;
  /** Set when the layer's source is a CompItem (precomp layer). */
  sourceCompName?: string;
}

interface VideoLayerInfo {
  id: number;
  name: string;
}

export type { InstalledFontData, SelectedLayerInfo, VideoLayerInfo };
