import type { Font, Footage } from 'plainly-types';
import { getAllComps, getFolderPath, getTextLayersByComp } from './utils';

/**
 * Prompts the user to select a folder, which will be used to collect project files.
 *
 * @returns {Folder|string} The selected folder, or undefined as a string if no folder is selected.
 */
function selectFolder(): Folder | string {
  const folder = Folder.selectDialog('Select folder to collect project files:');
  if (folder) return folder.fsName; // Return selected folder

  // NOTE: this always returns undefined as a string if no folder is selected
  return 'undefined';
}

/**
 * Collects project files, fonts, and footage into a designated folder,
 *
 * @returns {string|undefined} The name of the collected project folder, or undefined if no project is saved.
 */
function collectFiles(): string | undefined {
  const collectedData: { fonts: Font[]; footage: Footage[] } = {
    fonts: [],
    footage: [],
  };

  // collect paths
  collectedData.fonts = collectFonts();
  collectedData.footage = collectFootage();

  // return full path
  return JSON.stringify(collectedData);
}

function collectFonts(): Font[] {
  const comps = getAllComps(app.project);
  const fonts: { [psName: string]: Font } = {};

  for (let i = 0; i < comps.length; i++) {
    const layers = getTextLayersByComp(comps[i]);
    for (let j = 0; j < layers.length; j++) {
      const postScriptName = layers[j].sourceText.value.font;
      const fontLocation = layers[j].sourceText.value.fontLocation;
      const fontFamily = layers[j].sourceText.value.fontFamily;
      const fontStyle = layers[j].sourceText.value.fontStyle;

      if (fonts[postScriptName]) {
        continue; // already recorded
      }

      fonts[postScriptName] = {
        postScriptName: postScriptName,
        fontLocation: fontLocation,
        fontFamily: fontFamily,
        fontStyle: fontStyle,
      };
    }
  }

  return Object.values(fonts);
}

/**
 * Extensions After Effects can import as an image sequence. Video containers are
 * deliberately left out: they are not still based, but they are a single file.
 * PSD and AI are left out as well, since relinking skips them.
 */
const SEQUENCE_EXTENSIONS = [
  'png',
  'jpg',
  'jpeg',
  'jpe',
  'tga',
  'targa',
  'tif',
  'tiff',
  'exr',
  'dpx',
  'cin',
  'bmp',
  'hdr',
  'iff',
  'sgi',
  'rla',
  'rpf',
  'pict',
  'pct',
  'jp2',
];

/**
 * Determines whether a footage item is an image sequence rather than a single file.
 *
 * After Effects exposes no direct flag for this, so it is derived from the source
 * being non still footage (a sequence spans multiple frames) that points at a file
 * with a still image extension.
 *
 * @param {FootageItem} item - The footage item to inspect.
 * @returns {boolean} True if the item is an image sequence, false otherwise.
 */
function isImageSequence(item: FootageItem): boolean {
  const source = item.mainSource;
  if (!(source instanceof FileSource) || source.isStill) {
    return false;
  }
  if (item.file == null) {
    return false;
  }

  const name = item.file.name.toLowerCase();
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex === -1) {
    return false;
  }

  const extension = name.substring(dotIndex + 1);
  for (let i = 0; i < SEQUENCE_EXTENSIONS.length; i++) {
    if (SEQUENCE_EXTENSIONS[i] === extension) {
      return true;
    }
  }

  return false;
}

function collectFootage(): Footage[] {
  const footage: Footage[] = [];

  // Go through all items in the project
  for (let i = 1; i <= app.project.numItems; i++) {
    const item = app.project.item(i);
    if (!(item instanceof FootageItem)) {
      continue;
    }
    if (item.file == null) {
      continue;
    }

    // Determine the nested folder structure
    const relativePath = getFolderPath(item.parentFolder);

    footage.push({
      itemId: item.id,
      // NOTE: for an image sequence this is the first frame, which is also the
      // entry point After Effects needs to re-import the whole sequence
      itemName: item.file.name,
      itemFsPath: item.file.fsName,
      itemAeFolder: relativePath,
      isMissing: item.footageMissing,
      isSequence: isImageSequence(item),
    });
  }

  return footage;
}

export { collectFiles, selectFolder };
