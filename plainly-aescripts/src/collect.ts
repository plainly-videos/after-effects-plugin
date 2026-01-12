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
  const fonts: Font[] = [];

  for (let i = 0; i < comps.length; i++) {
    const layers = getTextLayersByComp(comps[i]);
    for (let j = 0; j < layers.length; j++) {
      const fontName = layers[j].sourceText.value.font;
      const fontLocation = layers[j].sourceText.value.fontLocation;
      const fontExtension = fontLocation.split('.').pop()?.toLowerCase();

      fonts.push({
        fontName: fontName,
        fontExtension: fontExtension,
        fontLocation: fontLocation,
      });
    }
  }

  return fonts;
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
      itemName: item.file.name,
      itemFsPath: item.file.fsName,
      itemAeFolder: relativePath,
      isMissing: item.footageMissing,
    });
  }

  return footage;
}

export { selectFolder, collectFiles };
