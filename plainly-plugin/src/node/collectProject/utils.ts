import type { Font, Footage } from 'plainly-types';
import { isWindows } from '../constants';
import { exists, finalizePath } from '../utils';

const fontkit = require('fontkit');

type FontkitCollection = { fonts: Array<{ postscriptName?: string }> };

function isFontkitCollection(font: unknown): font is FontkitCollection {
  return (
    typeof font === 'object' &&
    font !== null &&
    'fonts' in font &&
    Array.isArray((font as FontkitCollection).fonts)
  );
}

function getPostScriptNames(fontLocation: string): string[] {
  const font = fontkit.openSync(fontLocation);
  if (isFontkitCollection(font)) {
    return font.fonts
      .map((item) => item.postscriptName)
      .filter((name): name is string => Boolean(name));
  }

  const singleFont = font as { postscriptName?: string };
  return singleFont.postscriptName ? [singleFont.postscriptName] : [];
}

async function validateFonts(fonts: Font[]) {
  if (fonts.length === 0) return;

  // Throw in case of fonts missing extension
  const missingExtensionNames = fonts
    .filter((item) => !item.fontExtension)
    .map((font) => font.fontName);
  if (missingExtensionNames.length > 0) {
    throw new Error(
      `Fonts are missing extensions:\n${missingExtensionNames.join(', ')}`,
    );
  }

  // Throw in case of fonts missing location
  const missingLocationNames = fonts
    .filter((item) => !item.fontLocation)
    .map((font) => font.fontName);
  if (missingLocationNames.length > 0) {
    throw new Error(
      `Missing location for fonts on system:\n${missingLocationNames.join(', ')}`,
    );
  }

  // Throw in case of missing fonts
  const uniqueFonts = new Map<string, Font>();
  for (const font of fonts) {
    uniqueFonts.set(`${font.fontName}::${font.fontLocation}`, font);
  }
  const uniqueFontEntries = Array.from(uniqueFonts.values());
  const mismatchFonts: string[] = [];
  const unreadableFonts: string[] = [];

  for (const font of uniqueFontEntries) {
    const fontPath = finalizePath(font.fontLocation);
    if (!(await exists(fontPath))) {
      unreadableFonts.push(`${font.fontName} (file not found)`);
      continue;
    }

    try {
      const postScriptNames = getPostScriptNames(fontPath);
      const matches = postScriptNames.includes(font.fontName);
      if (!matches) {
        const foundNames = postScriptNames.length
          ? postScriptNames.join(', ')
          : 'unknown';
        mismatchFonts.push(`${font.fontName} (found: ${foundNames})`);
      }
    } catch (_error) {
      unreadableFonts.push(`${font.fontName} (failed to read font file)`);
    }
  }

  if (unreadableFonts.length > 0 || mismatchFonts.length > 0) {
    const messages: string[] = [];
    if (unreadableFonts.length > 0) {
      messages.push(
        `Fonts could not be read from disk:\n${unreadableFonts.join(', ')}`,
      );
    }
    if (mismatchFonts.length > 0) {
      messages.push(
        `Fonts are missing on the system (PostScript name mismatch):\n${mismatchFonts.join(', ')}`,
      );
    }
    throw new Error(messages.join('\n\n'));
  }
}

function validateFootage(footage: Footage[]) {
  // Throw in case of long paths
  const hasLongPaths = footage.some((item) => item.itemFsPath.length > 255);
  if (isWindows && hasLongPaths) {
    throw new Error(
      'Some footage paths are too long. Please shorten them and try again.',
    );
  }

  // Throw in case of missing footage
  const missingFootage = footage.filter((item) => item.isMissing);
  if (missingFootage.length > 0) {
    // TODO: Show a missing files
    throw new Error('Some footage files are missing from the project.');
  }
}

export { validateFonts, validateFootage };
