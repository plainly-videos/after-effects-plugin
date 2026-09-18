import path from 'path';
import type { Font, Footage } from 'plainly-types';
import { AeScriptsApi } from '../bridge';

async function validateFonts(fonts: Font[]) {
  if (fonts.length === 0) return;

  // Throw in case of fonts missing location
  const missingLocationNames = fonts
    .filter((item) => !item.fontLocation)
    .map((font) => font.postScriptName);
  if (missingLocationNames.length > 0) {
    throw new Error(
      `Missing location for fonts on system:\n${missingLocationNames.join(', ')}`,
    );
  }

  // Throw in case of missing fonts
  const missingFonts: string[] = [];
  for (const font of fonts) {
    const isFontInstalled = await AeScriptsApi.isFontInstalled(
      font.postScriptName,
      font.fontFamily,
      font.fontStyle,
    );
    if (!isFontInstalled) {
      missingFonts.push(font.postScriptName);
    }
  }

  if (missingFonts.length > 0) {
    throw new Error(
      `Fonts used in the project, are missing on the system:\n${missingFonts.join(', ')}. Please install them and try again. If the problem persists, try restarting After Effects after installation.`,
    );
  }
}

function validateFootage(footage: Footage[]) {
  // Throw in case of missing footage
  const missingFootage = footage.filter((item) => item.isMissing);
  if (missingFootage.length > 0) {
    // TODO: Show a missing files
    throw new Error('Some footage files are missing from the project.');
  }
}

/**
 * Spreads footage items that would be copied on top of each other across
 * numbered subfolders, and returns the footage with the folders applied.
 *
 * Every item is copied under its own file name, so two items sharing a basename
 * inside the same After Effects folder (`/a/logo.png` and `/b/logo.png`, or
 * `Logo.png` and `logo.png` on a case insensitive file system) would race for
 * the same destination and both end up relinked to whichever copy landed last.
 * The collision moves into a subfolder rather than renaming the file, because an
 * image sequence is picked up by the frame numbering around its name.
 *
 * @param footage The collected footage items.
 * @returns The footage items, each pointing at a free destination folder.
 */
function resolveFootageFolders(footage: Footage[]): Footage[] {
  // Destination, lowercased for case insensitive file systems, to the source it holds
  const taken = new Map<string, string>();

  return footage.map((item) => {
    const fileName = path.basename(item.itemFsPath);
    const source = item.itemFsPath.toLowerCase();
    const destination = (folder: string) =>
      path.join(folder, fileName).toLowerCase();
    const isTaken = (folder: string) => {
      const heldBy = taken.get(destination(folder));
      // Items pointing at the same file can share a destination
      return heldBy !== undefined && heldBy !== source;
    };

    let folder = item.itemAeFolder;
    for (let suffix = 2; isTaken(folder); suffix++) {
      folder = path.join(item.itemAeFolder, `(${suffix})`);
    }

    taken.set(destination(folder), source);
    return { ...item, itemAeFolder: folder };
  });
}

export { resolveFootageFolders, validateFonts, validateFootage };
