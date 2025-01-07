const fs = require('fs');
const fsPromises = require('fs/promises');
const archiver = require('archiver');
const path = require('path');
const crypto = require('crypto');

// @ts-ignore
import CSInterface from '../lib/CSInterface';
import { CollectFontsError, CollectFootageError } from './errors';
import type { CollectFilesResult, Fonts, Footage, ProjectInfo } from './types';
import {
  evalScriptAsync,
  finalizePath,
  generateFolders,
  runInParallelReturnRejected,
} from './utils';

const csInterface = new CSInterface();

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
async function collectFiles(targetPath: string): Promise<CollectFilesResult> {
  const result = await evalScriptAsync(`collectFiles("${targetPath}")`);

  const projectInfo: ProjectInfo = JSON.parse(result);

  const projectName = path.basename(projectInfo.projectPath, '.aep');
  const pathResolved = finalizePath(targetPath); // Normalize and resolve

  const folderName = crypto.randomUUID();
  await fsPromises.mkdir(path.join(pathResolved, folderName));
  const projectDir = path.join(pathResolved, folderName);

  const dest = path.join(projectDir, `${projectName}.aep`);
  await fsPromises.copyFile(finalizePath(projectInfo.projectPath), dest);

  await copyFonts(projectInfo.fonts, projectDir);
  await copyFootage(projectInfo.footage, projectDir);

  return { collectFilesDir: projectDir, projectName: projectName };
}

async function copyFonts(fonts: Fonts[], targetDir: string) {
  if (fonts.length === 0) {
    return;
  }

  const fontsDir = path.join(targetDir, 'Fonts');
  await fsPromises.mkdir(fontsDir);

  const fontPromises = fonts.map(async (font) => {
    const src = finalizePath(font.fontLocation);

    const dest = path.join(fontsDir, `${font.fontName}.${font.fontExtension}`);
    try {
      return await fsPromises.copyFile(src, dest);
    } catch (error) {
      throw new Error(src);
    }
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
function zip(targetPath: string, projectName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const targetPathResolved = finalizePath(targetPath); // Normalize and resolve

    // replace final part of path (random uuid) with project name to create zip with projectName.zip
    const zipPath = path.join(
      path.dirname(targetPathResolved),
      `${projectName}.zip`,
    );
    const outputZipPath = finalizePath(zipPath); // Normalize and resolve

    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 1 } });

    output.on('close', () => {
      console.log(`Zipped ${archive.pointer()} total bytes`);
      console.log(`Zip file created at: ${outputZipPath}`);
      resolve();
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
      maxRetires: 3,
      recursive: true,
      force: true,
    });
  } catch (error) {
    console.error(error);
  }
}

export { collectFiles, removeFolder, selectFolder, zip };