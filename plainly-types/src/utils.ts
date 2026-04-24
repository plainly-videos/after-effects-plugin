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
  /** True when the layer is an AVLayer whose source is a video footage file. */
  isVideo?: boolean;
  /** True when the layer is an AVLayer whose source is an audio footage file. */
  isAudio?: boolean;
}

interface VideoLayerInfo {
  id: number;
  name: string;
}

interface AudioLayerInfo {
  id: number;
  name: string;
}

export type {
  AudioLayerInfo,
  InstalledFontData,
  SelectedLayerInfo,
  VideoLayerInfo,
};
