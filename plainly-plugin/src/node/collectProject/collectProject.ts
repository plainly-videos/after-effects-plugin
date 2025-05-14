import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import fsPromises from 'fs/promises';

import { TMP_DIR, csInterface } from '../constants';
import { CollectFontsError, CollectFootageError } from '../errors';
import type { Fonts, Footage, ProjectInfo } from '../types';
import {
  evalScriptAsync,
  finalizePath,
  generateFolders,
  runInParallelReturnRejected,
} from '../utils';

/**
 * Opens a file dialog for the user to select a folder.
 *
 * @param callback a callback that will be called with the path of the selected folder.
 */
function selectFolder(callback: (result: string) => void) {
  csInterface.evalScript('selectFolder()', (result: string) =>
    callback(result),
  );
}

/**
 * Collects all files necessary for the project and puts them in the folder where original .aep is.
 */
async function copyProjectFiles(
  projectInfo: ProjectInfo,
  destDir: string,
  footageDir: string,
  footageDirRenamed: string,
  fontsDir: string,
  fontsDirRenamed: string,
): Promise<void> {
  await copyFonts(projectInfo.fonts, destDir, fontsDir, fontsDirRenamed);
  await copyFootage(
    projectInfo.footage,
    destDir,
    footageDir,
    footageDirRenamed,
  );
}

async function copyFonts(
  fonts: Fonts[],
  targetDir: string,
  fontsDir: string,
  fontsDirRenamed: string,
) {
  if (fonts.length === 0) {
    return;
  }

  // Remove duplicates based on fontLocation
  const uniqueFonts = fonts.reduce((acc, font) => {
    if (!acc.some((f) => f.fontLocation === font.fontLocation)) {
      acc.push(font);
    }
    return acc;
  }, [] as Fonts[]);

  const newFontsDir = path.join(targetDir, 'Fonts');
  await fsPromises.mkdir(newFontsDir);

  const fontPromises = uniqueFonts.map(async (font) => {
    let src = finalizePath(font.fontLocation);
    src = src.replace(fontsDir, fontsDirRenamed);

    const dest = path.join(
      newFontsDir,
      `${font.fontName}.${font.fontExtension}`,
    );
    // if the file doesn't end with .otf or .ttf, copy it, otherwise, throw an error
    if (['otf', 'ttf', 'ttc'].includes(font.fontExtension)) {
      return await fsPromises.copyFile(src, dest);
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

async function copyFootage(
  footage: Footage[],
  targetDir: string,
  footageDir: string,
  footageDirRenamed: string,
) {
  if (footage.length === 0) {
    return;
  }

  const newFootageDir = path.join(targetDir, '(Footage)');
  await fsPromises.mkdir(newFootageDir);

  const footagePromises = footage.map(async (footageItem) => {
    let src = finalizePath(footageItem.itemName);
    src = src.replace(footageDir, footageDirRenamed);
    const footageName = path.basename(footageItem.itemName);
    const folder = footageItem.itemFolder;

    if (folder === 'Root') {
      const dest = path.join(newFootageDir, footageName);
      return fsPromises.copyFile(finalizePath(footageItem.itemName), dest);
    }

    const replaced = folder.replace('Root', '');
    generateFolders(path.join(newFootageDir, replaced));

    const dest = path.join(newFootageDir, replaced, footageName);
    try {
      return await fsPromises.copyFile(src, dest);
    } catch (error) {
      throw new Error(src);
    }
  });

  const errors = await runInParallelReturnRejected(footagePromises);
  if (errors.length > 0) {
    throw new CollectFootageError(errors);
  }
}

/**
 * Zips the contents of the targetPath directory, and creates a zip file with the
 * project name.
 *
 * @param targetPath The path of the directory to zip.
 */
function zipItems(
  outputZipPath: string,
  items: { src: string; dest: string }[],
) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 1 } });

    output.on('close', () => {
      console.log(`Zipped ${archive.pointer()} bytes`);
      console.log(outputZipPath);

      resolve(outputZipPath);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    for (const item of items) {
      try {
        const stats = fs.statSync(item.src);
        if (stats.isFile()) {
          console.log('added file');
          archive.file(item.src, { name: item.dest });
        } else if (stats.isDirectory()) {
          console.log('added dir');
          archive.directory(item.src, item.dest);
        }
      } catch {
        // fonts or footage not found, ignoring...
      }
    }

    archive.finalize();
  });
}

/**
 * Removes the folder at the specified targetPath.
 *
 * @param targetPath The path of the folder to remove.
 */
async function removeFolder(targetPath: string) {
  const pathResolved = finalizePath(targetPath); // Normalize and resolve

  try {
    await fsPromises.rmdir(pathResolved, {
      maxRetries: 3,
      recursive: true,
    });
  } catch (error) {
    console.error(error);
  }
}

// Function to make a project zip with no target path specified
async function makeProjectZipTmpDir(): Promise<string> {
  await fsPromises.mkdir(TMP_DIR, { recursive: true });
  return makeProjectZip(TMP_DIR);
}

// Function to make a project zip with a specified target path
async function makeProjectZip(targetPath: string): Promise<string> {
  let aepFilePath = await evalScriptAsync('getProjectPath()');
  if (!aepFilePath) {
    throw new Error('Project not opened or not saved');
  }
  aepFilePath = finalizePath(aepFilePath);
  const aepFileDir = path.dirname(aepFilePath);

  // Get project info
  const result = await evalScriptAsync('collectFiles()');
  if (!result) {
    throw new Error('Failed to collect files');
  }
  const projectInfo: ProjectInfo = JSON.parse(result);

  // rename (Footage) and (Fonts) folders
  const footageDir = path.join(aepFileDir, '(Footage)');
  const fontsDir = path.join(aepFileDir, '(Fonts)');
  const footageDirRenamed = path.join(aepFileDir, '___(Footage)');
  const fontsDirRenamed = path.join(aepFileDir, '___(Fonts)');
  try {
    await fsPromises.rename(footageDir, footageDirRenamed);
  } catch {
    // ignore
  }
  try {
    await fsPromises.rename(fontsDir, fontsDirRenamed);
  } catch {
    // ignore
  }
  // collect files into the original aep folder
  await copyProjectFiles(
    projectInfo,
    aepFileDir,
    footageDir,
    footageDirRenamed,
    fontsDir,
    fontsDirRenamed,
  );
  // relink and save aep
  await evalScriptAsync('relinkFootage()');
  // zip (Footage), (Fonts) and aep files
  await zipItems(finalizePath(path.join(targetPath, 'aaa.zip')), [
    { src: aepFilePath, dest: path.basename(aepFilePath) },
    { src: footageDir, dest: '(Footage)' },
    { src: fontsDir, dest: '(Fonts)' },
  ]);
  // delete (Footage) and (Fonts) folders
  await removeFolder(footageDir);
  await removeFolder(fontsDir);
  // rename (Footage) and (Fonts) folders back
  try {
    await fsPromises.rename(footageDirRenamed, footageDir);
  } catch {
    // ignore
  }
  try {
    await fsPromises.rename(fontsDirRenamed, fontsDir);
  } catch {
    // ignore
  }
  // revert and save aep
  await evalScriptAsync('undoFootage()');

  return path.join(targetPath, 'aaa.zip');
}

export { makeProjectZipTmpDir, makeProjectZip, removeFolder, selectFolder };
