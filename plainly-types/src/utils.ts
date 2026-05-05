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
  /** Layer in-point in the parent comp's timeline, in seconds. */
  inPoint: number;
  /** Layer out-point in the parent comp's timeline, in seconds. */
  outPoint: number;
  /** Frame rate of the parent (active) comp. */
  compFrameRate: number;
  /** Set when the layer's source is a CompItem (precomp layer). */
  sourceCompId?: number;
  /** Set when the layer's source is a CompItem (precomp layer). */
  sourceCompName?: string;
  /** True when the layer is an AVLayer whose source is a video footage file. */
  isVideo?: boolean;
  /** True when the layer is an AVLayer whose source is an audio footage file. */
  isAudio?: boolean;
  /** True when the layer is an AVLayer whose source is an image footage file. */
  isImage?: boolean;
  /** True when the layer is a TextLayer. */
  isText?: boolean;
  /** True when the layer's source is a SolidSource. */
  isSolid?: boolean;
}

interface VideoLayerInfo {
  id: number;
  name: string;
  /** Layer in-point in its parent comp's timeline, in seconds. */
  inPoint: number;
  /** Layer out-point in its parent comp's timeline, in seconds. */
  outPoint: number;
  /** Frame rate of the parent comp. */
  compFrameRate: number;
}

interface AudioLayerInfo {
  id: number;
  name: string;
  /** Layer in-point in its parent comp's timeline, in seconds. */
  inPoint: number;
  /** Layer out-point in its parent comp's timeline, in seconds. */
  outPoint: number;
  /** Frame rate of the parent comp. */
  compFrameRate: number;
}

export type {
  AudioLayerInfo,
  InstalledFontData,
  SelectedLayerInfo,
  VideoLayerInfo,
};
