import type { Font, Footage } from 'plainly-types';
import { AeScriptsApi } from '../bridge';

async function validateFonts(fonts: Font[]) {
  if (fonts.length === 0) return;

  // Throw in case of fonts missing extension
  const missingExtensionNames = fonts
    .filter((item) => !item.fontExtension)
    .map((font) => font.postScriptName)
    .filter((value, index, self) => self.indexOf(value) === index); // Unique
  if (missingExtensionNames.length > 0) {
    throw new Error(
      `Fonts are missing extensions:\n${missingExtensionNames.join(', ')}`,
    );
  }

  // Throw in case of fonts missing location
  const missingLocationNames = fonts
    .filter((item) => !item.fontLocation)
    .map((font) => font.postScriptName)
    .filter((value, index, self) => self.indexOf(value) === index); // Unique
  if (missingLocationNames.length > 0) {
    throw new Error(
      `Missing location for fonts on system:\n${missingLocationNames.join(', ')}`,
    );
  }

  // Throw in case of missing fonts
  // Feature exists in After Effects 24.0+
  const aeVersion = await AeScriptsApi.getAfterEffectsVersion();
  if (Number(aeVersion) >= 24.0) {
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

    const uniqueMissingFonts = missingFonts.filter(
      (value, index, self) => self.indexOf(value) === index,
    );

    if (uniqueMissingFonts.length > 0) {
      throw new Error(
        `Fonts used in the project, are missing on the system:\n${uniqueMissingFonts.join(', ')}. Please install them and try again.`,
      );
    }
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
