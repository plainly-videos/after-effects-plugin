import path from 'path';
import fsPromises from 'fs/promises';

import { TMP_DIR, csInterface } from '../constants';
import type { ProjectInfo } from '../types';
import { evalScriptAsync, finalizePath, zipItems } from '../utils';
import { copyFonts } from './copyFonts';
import { copyFootage } from './copyFootage';

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

async function renameIfExists(src: string, dest: string): Promise<void> {
  try {
    await fsPromises.rename(src, dest);
  } catch (error) {
    // ignore
  }
}

async function makeProjectZip(targetPath: string): Promise<string> {
  let aepFilePath = await evalScriptAsync('getProjectPath()');
  if (!aepFilePath) throw new Error('Project not opened or not saved');
  aepFilePath = finalizePath(aepFilePath);

  const aepFileDir = path.dirname(aepFilePath);
  const aepFileName = path.basename(aepFilePath, '.aep');

  const result = await evalScriptAsync('collectFiles()');
  if (!result) throw new Error('Failed to collect files');
  const projectInfo: ProjectInfo = JSON.parse(result);

  const footageDir = path.join(aepFileDir, '(Footage)');
  const fontsDir = path.join(aepFileDir, '(Fonts)');
  const randomPrefix = crypto.randomUUID().split('-')[0];
  const footageDirRenamed = path.join(aepFileDir, `${randomPrefix}-(Footage)`);
  const fontsDirRenamed = path.join(aepFileDir, `${randomPrefix}-(Fonts)`);

  const undoStack: (() => Promise<void>)[] = [];

  try {
    await renameIfExists(footageDir, footageDirRenamed);
    undoStack.push(() => renameIfExists(footageDirRenamed, footageDir));

    await renameIfExists(fontsDir, fontsDirRenamed);
    undoStack.push(() => renameIfExists(fontsDirRenamed, fontsDir));

    await copyFootage(
      projectInfo.footage,
      aepFileDir,
      footageDir,
      footageDirRenamed,
    );
    undoStack.push(() => removeFolder(footageDir));

    await copyFonts(projectInfo.fonts, aepFileDir);
    undoStack.push(() => removeFolder(fontsDir));

    await evalScriptAsync('relinkFootage()');
    undoStack.unshift(async () => {
      evalScriptAsync('undoFootage()');
    });

    const zipPath = finalizePath(path.join(targetPath, `${aepFileName}.zip`));
    await zipItems(zipPath, [
      { src: aepFilePath, dest: path.basename(aepFilePath), isRequired: true },
      {
        src: footageDir,
        dest: '(Footage)',
        isRequired: projectInfo.footage.length > 0,
      },
      {
        src: fontsDir,
        dest: '(Fonts)',
        isRequired: projectInfo.fonts.length > 0,
      },
    ]);

    return zipPath;
  } finally {
    for (let i = undoStack.length - 1; i >= 0; i--) {
      try {
        await undoStack[i]();
      } catch (undoErr) {
        // TODO: What to do here?
        console.error('Undo failed:', undoErr);
      }
    }
  }
}

export { makeProjectZipTmpDir, makeProjectZip, removeFolder, selectFolder };
