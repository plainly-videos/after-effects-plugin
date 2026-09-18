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
 * Strips the frame number off a file name, giving the name shared by every frame
 * of its sequence (`shot_0001.png` -> `shot_.png`), or undefined if the name is
 * not numbered.
 */
function numberedFamily(fileName: string): string | undefined {
  const extension = path.extname(fileName);
  const numbered = /^(.*?)\d+$/.exec(path.basename(fileName, extension));

  // Padding is ignored, so differently padded names are read as one family and
  // kept apart although they could not collide
  return numbered ? `${numbered[1]}${extension}` : undefined;
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
 * A sequence is copied frame by frame, so it claims every name in its numbering
 * and not only the frame the project points at.
 *
 * @param footage The collected footage items.
 * @returns The footage items, each pointing at a free destination folder.
 */
function resolveFootageFolders(footage: Footage[]): Footage[] {
  // Destination, lowercased for case insensitive file systems, to the source it holds
  const taken = new Map<string, string>();
  // The same for a whole numbering, holding whether a sequence claimed it
  const families = new Map<string, { source: string; isSequence: boolean }>();

  return footage.map((item) => {
    const fileName = path.basename(item.itemFsPath);
    const familyName = numberedFamily(fileName);
    const source = item.itemFsPath.toLowerCase();
    const destination = (folder: string, name: string) =>
      path.join(folder, name).toLowerCase();
    const isTaken = (folder: string) => {
      const heldBy = taken.get(destination(folder, fileName));
      // Items pointing at the same file can share a destination
      if (heldBy !== undefined && heldBy !== source) {
        return true;
      }

      if (!familyName) {
        return false;
      }

      const family = families.get(destination(folder, familyName));
      return (
        family !== undefined &&
        family.source !== source &&
        // Two stills that merely look numbered never write over each other
        (item.isSequence === true || family.isSequence)
      );
    };

    let folder = item.itemAeFolder;
    for (let suffix = 2; isTaken(folder); suffix++) {
      folder = path.join(item.itemAeFolder, `(${suffix})`);
    }

    taken.set(destination(folder, fileName), source);
    if (familyName) {
      const key = destination(folder, familyName);
      families.set(key, {
        source,
        isSequence:
          item.isSequence === true || families.get(key)?.isSequence === true,
      });
    }
    return { ...item, itemAeFolder: folder };
  });
}

export { resolveFootageFolders, validateFonts, validateFootage };
