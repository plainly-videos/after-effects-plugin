import fsPromises from 'fs/promises';
import path from 'path';
import type { Font } from 'plainly-types';
import { CollectFontsError } from '../errors';
import { finalizePath, runInParallelReturnRejected } from '../utils';

export async function copyFonts(fonts: Font[], targetDir: string) {
  if (fonts.length === 0) {
    return;
  }

  // Remove duplicates based on fontLocation
  const uniqueFonts = fonts.reduce((acc, font) => {
    if (!acc.some((f) => f.fontLocation === font.fontLocation)) {
      acc.push(font);
    }
    return acc;
  }, [] as Font[]);

  const newFontsDir = path.join(targetDir, 'Fonts');
  await fsPromises.mkdir(newFontsDir);

  const fontPromises = uniqueFonts.map(async (font) => {
    const src = finalizePath(font.fontLocation);

    if (font.fontExtension) {
      const dest = path.join(
        newFontsDir,
        `${font.fontName}.${font.fontExtension}`,
      );
      // if the file doesn't end with .otf or .ttf, copy it, otherwise, throw an error
      if (['otf', 'ttf', 'ttc'].includes(font.fontExtension)) {
        return await fsPromises.copyFile(src, dest);
      }
    }

    throw new Error(
      `Unsupported font format: ${font.fontExtension} for font ${font.fontName} (Source Path: ${src})`,
    );
  });

  const errors = await runInParallelReturnRejected(fontPromises);
  if (errors.length > 0) {
    throw new CollectFontsError(errors);
  }
}
