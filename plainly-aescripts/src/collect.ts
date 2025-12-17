import { getAllComps, getFolderPath, getTextLayersByComp } from './utils';

interface FontPath {
  fontName: string;
  fontExtension: string | undefined;
  fontLocation: string;
}

interface FootagePath {
  itemId: number;
  itemName: string;
  itemFsPath: string;
  itemAeFolder: string;
  isMissing: boolean;
}

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
  const collectedData: { fonts: FontPath[]; footage: FootagePath[] } = {
    fonts: [],
    footage: [],
  };

  // collect paths
  collectedData.fonts = collectFonts();
  collectedData.footage = collectFootage();

  // return full path
  return JSON.stringify(collectedData);
}

function collectFonts(): FontPath[] {
  const comps = getAllComps(app.project);
  const fontPaths: FontPath[] = [];

  for (let i = 0; i < comps.length; i++) {
    const layers = getTextLayersByComp(comps[i]);
    for (let j = 0; j < layers.length; j++) {
      const fontName = layers[j].sourceText.value.font;
      const fontExtension = new File(
        layers[j].sourceText.value.fontLocation,
      ).name
        .split('.')
        .pop()
        ?.toLowerCase();

      const fontLocation = layers[j].sourceText.value.fontLocation;
      fontPaths.push({
        fontName: fontName,
        fontExtension: fontExtension,
        fontLocation: fontLocation,
      });
    }
  }

  return fontPaths;
}

function collectFootage(): FootagePath[] {
  const footagePaths: FootagePath[] = [];

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

    footagePaths.push({
      itemId: item.id,
      itemName: item.file.name,
      itemFsPath: item.file.fsName,
      itemAeFolder: relativePath,
      isMissing: item.footageMissing,
    });
  }

  return footagePaths;
}

export { selectFolder, collectFiles };
export type { FontPath, FootagePath };
