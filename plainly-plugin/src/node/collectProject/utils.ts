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

export { validateFonts, validateFootage };
