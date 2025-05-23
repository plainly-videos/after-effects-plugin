import crypto from 'crypto';
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
 * Collects all files necessary for the project and puts them in the target folder.
 *
 * @param targetPath the path of the folder where the files will be copied.
 */
async function collectProjectFiles(targetPath: string): Promise<string> {
  const result = await evalScriptAsync(`collectFiles("${targetPath}")`);
  if (!result) {
    throw new Error('Failed to collect files');
  }

  const projectPath = await evalScriptAsync('getProjectPath()');
  if (!projectPath) {
    throw new Error('Project not opened or not saved');
  }
  const finalizedProjectPath = finalizePath(projectPath);

  const projectInfo: ProjectInfo = JSON.parse(result);

  const projectName = path.basename(finalizedProjectPath, '.aep');
  const pathResolved = finalizePath(targetPath); // Normalize and resolve

  const folderName = crypto.randomUUID();
  await fsPromises.mkdir(path.join(pathResolved, folderName), {
    recursive: true,
  });
  const projectDir = path.join(pathResolved, folderName);

  const dest = path.join(projectDir, `${projectName}.aep`);
  await fsPromises.copyFile(finalizedProjectPath, dest);

  await copyFonts(projectInfo.fonts, projectDir);
  await copyFootage(projectInfo.footage, projectDir);

  return projectDir;
}

async function copyFonts(fonts: Fonts[], targetDir: string) {
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

  const fontsDir = path.join(targetDir, 'Fonts');
  await fsPromises.mkdir(fontsDir);

  const fontPromises = uniqueFonts.map(async (font) => {
    const src = finalizePath(font.fontLocation);

    const dest = path.join(fontsDir, `${font.fontName}.${font.fontExtension}`);
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

async function copyFootage(footage: Footage[], targetDir: string) {
  if (footage.length === 0) {
    return;
  }

  const footageDir = path.join(targetDir, '(Footage)');
  await fsPromises.mkdir(footageDir);

  const footagePromises = footage.map(async (footageItem) => {
    const src = finalizePath(footageItem.itemName);
    const footageName = path.basename(footageItem.itemName);
    const folder = footageItem.itemFolder;

    if (folder === 'Root') {
      const dest = path.join(footageDir, footageName);
      return fsPromises.copyFile(finalizePath(footageItem.itemName), dest);
    }

    const replaced = folder.replace('Root', '');
    generateFolders(path.join(footageDir, replaced));

    const dest = path.join(footageDir, replaced, footageName);
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
function zip(targetPath: string, projectName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const targetPathResolved = finalizePath(targetPath); // Normalize and resolve

    // replace final part of path (random uuid) with project name to create zip with projectName.zip
    const zipPath = path.join(
      path.dirname(targetPathResolved),
      `${projectName}.zip`,
    );

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 1 } });

    output.on('close', () => {
      console.log(`Zipped ${archive.pointer()} total bytes`);
      console.log(`Zip file created at: ${zipPath}`);
      resolve(zipPath);
    });

    archive.on('error', (err: unknown) => {
      reject(err);
      return;
    });

    archive.pipe(output);

    // Append the directory content to the archive
    archive.directory(targetPathResolved, false);

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
async function makeProjectZipTmpDir() {
  await fsPromises.mkdir(TMP_DIR, { recursive: true });
  return makeProjectZip(TMP_DIR);
}

// Function to make a project zip with a specified target path
async function makeProjectZip(targetPath: string) {
  const collectFilesDir = await collectProjectFiles(targetPath);
  const projectPath = await evalScriptAsync('getProjectPath()');
  if (!projectPath) {
    throw new Error('Project not opened or not saved');
  }
  const finalizedProjectPath = finalizePath(projectPath);

  const projectName = path.basename(finalizedProjectPath, '.aep');
  const zipPath = await zip(collectFilesDir, projectName);
  return { collectFilesDir, zipPath };
}

export { makeProjectZipTmpDir, makeProjectZip, removeFolder, selectFolder };
