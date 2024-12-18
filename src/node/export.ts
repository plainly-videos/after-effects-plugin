const fs = require('fs');
const fsPromises = require('fs/promises');
const archiver = require('archiver');
const path = require('path');

// @ts-ignore
import CSInterface from '../lib/CSInterface';
import { evalScriptAsync, finalizePath, generateFolders } from './utils';

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
 * @param callback a callback that will be called with the project name.
 */
async function collectFiles(targetPath: string): Promise<string> {
  const result = await evalScriptAsync(`collectFiles("${targetPath}")`);

  const filePaths: {
    project: string;
    fonts: {
      fontName: string;
      fontExtension: string;
      fontLocation: string;
    }[];
    footage: { itemName: string; itemFolder: string }[];
  } = JSON.parse(result);

  const projectName = path.basename(filePaths.project, '.aep');
  const pathResolved = finalizePath(targetPath); // Normalize and resolve

  await fsPromises.mkdir(path.join(pathResolved, projectName));
  const projectDir = path.join(pathResolved, projectName);

  const dest = path.join(projectDir, `${projectName}.aep`);
  await fsPromises.copyFile(finalizePath(filePaths.project), dest);

  // copy fonts
  if (filePaths.fonts.length > 0) {
    const fontsDir = path.join(projectDir, 'Fonts');
    await fsPromises.mkdir(fontsDir);

    for (let i = 0; i < filePaths.fonts.length; i++) {
      const font = filePaths.fonts[i];
      const dest = path.join(
        fontsDir,
        `${font.fontName}.${font.fontExtension}`,
      );

      await fsPromises.copyFile(finalizePath(font.fontLocation), dest);
    }
  }

  // copy footage
  if (filePaths.footage.length > 0) {
    const footageDir = path.join(projectDir, 'Footage');
    await fsPromises.mkdir(footageDir);

    for (let i = 0; i < filePaths.footage.length; i++) {
      const footage = filePaths.footage[i];
      const footageName = path.basename(footage.itemName, '.aep');

      const folder = footage.itemFolder;

      if (folder === 'Root') {
        const dest = path.join(footageDir, `${footageName}.aep`);
        await fsPromises.copyFile(finalizePath(filePaths.project), dest);
      } else {
        generateFolders(path.join(footageDir, folder.replace('Root', '')));

        const replaced = folder.replace('Root', '');
        const dest = path.join(footageDir, replaced, `${footageName}.aep`);
        await fsPromises.copyFile(finalizePath(filePaths.project), dest);
      }
    }
  }

  return projectDir;
}

/**
 * Zips the contents of the zipPath directory, and creates a zip file with the
 * same name as the directory, but with a .zip extension.
 *
 * @param zipPath The path of the directory to zip.
 */
function zip(zipPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const pathResolved = finalizePath(zipPath); // Normalize and resolve

    const outputZipPath = `${pathResolved}.zip`;
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

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
    archive.directory(pathResolved, false);

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
    console.log(`Removed ${path}`);
  } catch (error) {
    console.error(error);
  }
}

export { collectFiles, removeFolder, selectFolder, zip };
