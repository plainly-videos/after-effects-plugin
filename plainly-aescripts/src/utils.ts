import type {
  AudioLayerInfo,
  InstalledFontData,
  SelectedLayerInfo,
  VideoLayerInfo,
} from 'plainly-types';

const VIDEO_FILE_EXTENSIONS: string[] = [
  'crm',
  'mxf',
  'mov',
  '3gp',
  '3g2',
  'amc',
  'swf',
  'flv',
  'f4v',
  'gif',
  'm2ts',
  'm4v',
  'mpg',
  'mpe',
  'mpa',
  'mpv',
  'mod',
  'm2p',
  'm2v',
  'm2a',
  'm2t',
  'mp4',
  'omf',
  'avi',
  'wmv',
  'wma',
  'webm',
];

const AUDIO_FILE_EXTENSIONS: string[] = [
  'mp2',
  'aac',
  'm4a',
  'aif',
  'aiff',
  'mp3',
  'mpeg',
  'mpg',
  'mpa',
  'mpe',
  'wav',
  'webm',
];

function hasVideoExtension(path: string): boolean {
  const dot = path.lastIndexOf('.');
  if (dot === -1) return false;
  const ext = path.substring(dot + 1).toLowerCase();
  for (let i = 0; i < VIDEO_FILE_EXTENSIONS.length; i++) {
    if (VIDEO_FILE_EXTENSIONS[i] === ext) return true;
  }
  return false;
}

// Video priority: an extension that appears in both lists (e.g. 'mpg', 'webm')
// is classified as video, never as audio. Audio is reserved for pure-audio
// formats like 'mp3', 'wav', 'aac'.
function hasAudioExtension(path: string): boolean {
  if (hasVideoExtension(path)) return false;
  const dot = path.lastIndexOf('.');
  if (dot === -1) return false;
  const ext = path.substring(dot + 1).toLowerCase();
  for (let i = 0; i < AUDIO_FILE_EXTENSIONS.length; i++) {
    if (AUDIO_FILE_EXTENSIONS[i] === ext) return true;
  }
  return false;
}

/**
 * @function isWin
 * @description Determines if the current OS is Windows
 * @returns {boolean} True if the OS is Windows, false otherwise
 */
function isWin(): boolean {
  return $.os.indexOf('Win') !== -1;
}

/**
 * Joins multiple path segments into a single path string.
 *
 * @param {...string} args - The path segments to join.
 * @returns {string} The combined path string, using the appropriate
 * separator for the current OS ('\\' for Windows, '/' for Mac).
 */
function pathJoin(...args: string[]): string {
  const path = isWin() ? '\\' : '/';
  return args.join(path);
}

/**
 * @function getAllComps
 * @description Get all comp items in a given After Effects project
 * @param {Project} project - The After Effects project object
 * @returns {Array<CompItem>} An array of CompItem objects
 */
function getAllComps(project: Project): Array<CompItem> {
  const comps: CompItem[] = [];

  for (let i = 1; i <= project.numItems; i++) {
    const item = project.item(i);
    if (item instanceof CompItem) {
      comps.push(item);
    }
  }

  return comps;
}

/**
 * @function getTextLayersByComp
 * @description Get all text layers in a given After Effects comp
 * @param {CompItem} comp - The After Effects comp object
 * @returns {Array<TextLayer>} An array of TextLayer objects
 */
function getTextLayersByComp(comp: CompItem): Array<TextLayer> {
  const layers: TextLayer[] = [];

  for (let i = 1; i <= comp.numLayers; i++) {
    const layer = comp.layer(i);
    if (layer instanceof TextLayer) {
      layers.push(layer);
    }
  }

  return layers;
}

function getFolderPath(folder: FolderItem): string {
  if (folder.parentFolder === null || folder === app.project.rootFolder) {
    return '';
  }

  // Recursively build the folder path
  const parentPath = getFolderPath(folder.parentFolder);
  return pathJoin(parentPath, folder.name);
}

/**
 * @function getCompLayerNames
 * @description Get all layer names in a given After Effects comp by ID
 * @param {string} compId - The ID of the comp
 * @returns {string} JSON array of layer names
 */
function getCompLayerNames(compId: string): string {
  const comp = app.project.itemByID(Number(compId));
  if (!comp || !(comp instanceof CompItem)) return JSON.stringify([]);

  const names: string[] = [];
  for (let i = 1; i <= comp.numLayers; i++) {
    names.push(comp.layer(i).name);
  }
  return JSON.stringify(names);
}

function getInstalledFontsByPostScriptName(
  postScriptName: string,
): string | undefined {
  try {
    const fontObjects = app.fonts.getFontsByPostScriptName(postScriptName);

    if (!fontObjects || fontObjects?.length === 0) return undefined;
    const fontData: InstalledFontData[] = [];
    for (let i = 0; i < fontObjects.length; i++) {
      const font = fontObjects[i];
      fontData.push({
        isSubstitute: font.isSubstitute,
        fontLocation: font.location,
      });
    }
    return JSON.stringify(fontData);
  } catch {
    return undefined;
  }
}

function getInstalledFontsByFamilyNameAndStyleName(
  familyName: string,
  styleName: string,
) {
  try {
    const fontObjects = app.fonts.getFontsByFamilyNameAndStyleName(
      familyName,
      styleName,
    );
    if (!fontObjects || fontObjects.length === 0) return undefined;

    const fontData: InstalledFontData[] = [];
    for (let i = 0; i < fontObjects.length; i++) {
      const font = fontObjects[i];
      fontData.push({
        isSubstitute: font.isSubstitute,
        fontLocation: font.location,
      });
    }
    return JSON.stringify(fontData);
  } catch (error) {
    return undefined;
  }
}
/**
 * Deselects every currently selected layer across all compositions in the active project.
 *
 * Iterates through all `CompItem` instances in `app.project`, aggregates their `selectedLayers`,
 * and sets each layer's `selected` property to `false`.
 *
 * @returns {void}
 */
function unselectAllLayers(): void {
  const comps = getAllComps(app.project);
  let selectedLayers: Layer[] = [];
  for (let i = 0; i < comps.length; i++) {
    const comp = comps[i];
    selectedLayers = selectedLayers.concat(comp.selectedLayers);
  }

  for (let i = 0; i < selectedLayers.length; i++) {
    const layer = selectedLayers[i];
    layer.selected = false;
  }
}

/**
 * Selects a layer in the active project by its numeric ID.
 *
 * Uses `app.project.layerByID` after parsing the provided string to base-10 integer. If a layer
 * with the given ID exists, its `selected` property is set to `true`; otherwise the function exits silently.
 *
 * @param {string} layerId - The string representation of the layer's numeric ID (e.g. value from `Layer.id`).
 * @returns {void}
 * @example
 * // Select a layer whose id is 1234
 * selectLayer('1234');
 */
function selectLayer(layerId: string): void {
  unselectAllProjectItems();
  unselectAllLayers();
  const layer = app.project.layerByID(parseInt(layerId, 10));
  if (layer) {
    // open the comp that contains the layer, so it is visible to the user in timeline
    const comp = layer.containingComp;
    comp.time = layer.inPoint;
    const viewer = comp.openInViewer();
    if (viewer?.active === false) viewer.setActive();

    layer.selected = true;
  }
}

/**
 * Deselects all items in the project panel tree.
 *
 * Iterates through all items in `app.project.items` and sets each item's `selected` property to `false`.
 *
 * @returns {void}
 */
function unselectAllProjectItems(): void {
  for (let i = 1; i <= app.project.numItems; i++) {
    const item = app.project.item(i);
    item.selected = false;
  }
}

/**
 * Selects a composition in the active project by its numeric ID.
 *
 * Uses `app.project.itemByID` after parsing the provided string to base-10 integer. If a composition
 * with the given ID exists, it is opened in a viewer and its `selected` property is set to `true`;
 * otherwise the function exits silently.
 *
 * @param {string} compId - The string representation of the composition's numeric ID (e.g. value from `CompItem.id`).
 * @returns {void}
 * @example
 * // Select a composition whose id is 5678
 * selectComp('5678');
 */
function selectComp(compId: string): void {
  unselectAllProjectItems();
  unselectAllLayers();
  const comp = app.project.itemByID(parseInt(compId, 10));
  if (comp instanceof CompItem) {
    const viewer = comp.openInViewer();
    comp.selected = true;
    if (viewer?.active === false) {
      viewer.setActive();
    }
  }
}

/**
 * Selects a file item in the active project by its numeric ID.
 *
 * Uses `app.project.itemByID` after parsing the provided string to base-10 integer. If a file
 * with the given ID exists, its `selected` property is set to `true`; otherwise the function exits silently.
 *
 * @param {string} fileId - The string representation of the file's numeric ID (e.g. value from `FootageItem.id`).
 * @returns {void}
 * @example
 * // Select a file whose id is 91011
 * selectFile('91011');
 */
function selectFile(fileId: string): void {
  unselectAllProjectItems();
  unselectAllLayers();
  const file = app.project.itemByID(parseInt(fileId, 10));
  if (file) {
    file.selected = true;
  }
}

/**
 * Returns the layers currently selected in the active (working) composition.
 *
 * The working composition is `app.project.activeItem` when it is a `CompItem`.
 * If no composition is active, an empty array is returned.
 *
 * @returns {string} JSON array of SelectedLayerInfo entries.
 */
function getSelectedLayers(): string {
  const active = app.project.activeItem;
  if (!(active instanceof CompItem)) return JSON.stringify([]);

  const selected = active.selectedLayers;
  const result: SelectedLayerInfo[] = [];
  for (let i = 0; i < selected.length; i++) {
    const layer = selected[i];
    const info: SelectedLayerInfo = {
      id: layer.id,
      name: layer.name,
      index: layer.index,
      compId: active.id,
      compName: active.name,
    };
    if (layer instanceof AVLayer) {
      const src = layer.source;
      if (src instanceof CompItem) {
        info.sourceCompId = src.id;
        info.sourceCompName = src.name;
      } else if (src instanceof FootageItem && src.file != null) {
        const fsName = src.file.fsName;
        if (hasVideoExtension(fsName)) {
          info.isVideo = true;
        } else if (hasAudioExtension(fsName)) {
          info.isAudio = true;
        }
      }
    }
    result.push(info);
  }
  return JSON.stringify(result);
}

/**
 * Returns all video layers inside the given composition in timeline order
 * (layer index ascending). Returns an empty array if the comp has no videos
 * or cannot be resolved.
 *
 * A "video layer" is an AVLayer whose source is a FootageItem backed by a file
 * with a recognized video extension.
 */
function getAllVideoLayersInComp(compId: string): string {
  const comp = app.project.itemByID(parseInt(compId, 10));
  if (!(comp instanceof CompItem)) return JSON.stringify([]);

  const result: VideoLayerInfo[] = [];
  for (let i = 1; i <= comp.numLayers; i++) {
    const layer = comp.layer(i);
    if (!(layer instanceof AVLayer)) continue;
    const src = layer.source;
    if (!(src instanceof FootageItem)) continue;
    if (src.file == null) continue;
    if (!hasVideoExtension(src.file.fsName)) continue;

    result.push({
      id: layer.id,
      name: layer.name,
    });
  }
  return JSON.stringify(result);
}

/**
 * Returns all audio layers inside the given composition in timeline order
 * (layer index ascending). Returns an empty array if the comp has no audio
 * layers or cannot be resolved.
 *
 * An "audio layer" is an AVLayer whose source is a FootageItem backed by a
 * file with a recognized audio extension that is not also a video extension.
 */
function getAllAudioLayersInComp(compId: string): string {
  const comp = app.project.itemByID(parseInt(compId, 10));
  if (!(comp instanceof CompItem)) return JSON.stringify([]);

  const result: AudioLayerInfo[] = [];
  for (let i = 1; i <= comp.numLayers; i++) {
    const layer = comp.layer(i);
    if (!(layer instanceof AVLayer)) continue;
    const src = layer.source;
    if (!(src instanceof FootageItem)) continue;
    if (src.file == null) continue;
    if (!hasAudioExtension(src.file.fsName)) continue;

    result.push({
      id: layer.id,
      name: layer.name,
    });
  }
  return JSON.stringify(result);
}

/**
 * Generates a UUID (Universally Unique Identifier) string in the format 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.
 *
 * @returns {string} A randomly generated UUID string.
 * @example
 * const newUuid = uuid();
 * console.log(newUuid); // Outputs something like '3f2504e0-4f89-11d3-9a0c-0305e82c3301'
 */
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export {
  getAllAudioLayersInComp,
  getAllComps,
  getAllVideoLayersInComp,
  getFolderPath,
  getInstalledFontsByFamilyNameAndStyleName,
  getInstalledFontsByPostScriptName,
  getCompLayerNames,
  getSelectedLayers,
  getTextLayersByComp,
  isWin,
  pathJoin,
  selectLayer,
  selectComp,
  selectFile,
  uuid,
};
