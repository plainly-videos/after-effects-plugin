import fsPromises from 'fs/promises';
import path from 'path';
import type { Footage } from 'plainly-types';
import { AeScriptsApi } from '../bridge/AeScriptsApi';
import { isWindows, TMP_DIR } from '../constants';
import { exists, finalizePath, renameIfExists, zipItems } from '../utils';
import { copyFonts } from './copyFonts';
import { copyFootage } from './copyFootage';
import { validateFonts, validateFootage } from './utils';

/**
 * Opens a file dialog for the user to select a folder.
 *
 * @param callback a callback that will be called with the path of the selected folder.
 */
async function selectFolder(): Promise<string | undefined> {
  return await AeScriptsApi.selectFolder();
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

function makeNewRelinkData(
  footage: Footage[],
  footageDir: string,
): Record<string, string> {
  return footage.reduce(
    (acc, item) => {
      const itemId = item.itemId.toString();
      const itemPath = path.join(footageDir, item.itemAeFolder, item.itemName);
      acc[itemId] = itemPath;
      return acc;
    },
    {} as Record<string, string>,
  );
}

function makeOriginalRelinkData(footage: Footage[]): Record<string, string> {
  return footage.reduce(
    (acc, item) => {
      const itemId = item.itemId.toString();
      acc[itemId] = item.itemFsPath;
      return acc;
    },
    {} as Record<string, string>,
  );
}

async function makeProjectZip(targetPath: string): Promise<string> {
  // save project first
  await AeScriptsApi.saveProject();

  let aepFilePath = await AeScriptsApi.getProjectPath();
  if (!aepFilePath) throw new Error('Project not opened or not saved');
  aepFilePath = finalizePath(aepFilePath);

  const aepFileDir = path.dirname(aepFilePath);
  const aepFileName = path.basename(aepFilePath, '.aep');

  // 1. Collect project data
  const projectInfo = await AeScriptsApi.collectFiles();

  const hasLongFootagePaths = projectInfo.footage.some((item) => {
    const itemPath = item.itemFsPath;
    return itemPath.length > 255;
  });

  validateFootage(projectInfo.footage);
  await validateFonts(projectInfo.fonts);

  const footageDir = path.join(aepFileDir, '(Footage)');
  const fontsDir = path.join(aepFileDir, 'Fonts');
  const randomPrefix = crypto.randomUUID().split('-')[0];
  const footageDirRenamed = path.join(aepFileDir, `${randomPrefix}-(Footage)`);
  const fontsDirRenamed = path.join(aepFileDir, `${randomPrefix}-Fonts`);

  const undoStack: (() => Promise<void>)[] = [];

  try {
    // 2. Rename (Footage) folder to avoid conflicts
    await renameIfExists(footageDir, footageDirRenamed)
      .catch((e) => {
        if (isWindows && hasLongFootagePaths) {
          throw new Error(
            'Some footage paths are too long. Please shorten them and try again.',
          );
        }
        throw e;
      })
      .finally(() =>
        undoStack.push(() => renameIfExists(footageDirRenamed, footageDir)),
      );

    // 3. Rename Fonts folder to avoid conflicts
    await renameIfExists(fontsDir, fontsDirRenamed).finally(() =>
      undoStack.push(() => renameIfExists(fontsDirRenamed, fontsDir)),
    );

    // 4. Copy project files to the (Footage) folder
    await copyFootage(
      projectInfo.footage,
      aepFileDir,
      footageDir,
      footageDirRenamed,
    ).finally(() =>
      undoStack.push(async () => {
        if (await exists(footageDir)) {
          await removeFolder(footageDir);
        }
      }),
    );

    // 5. Copy project fonts to the Fonts folder
    await copyFonts(projectInfo.fonts, aepFileDir).finally(() =>
      undoStack.push(async () => {
        if (await exists(fontsDir)) {
          await removeFolder(fontsDir);
        }
      }),
    );

    // 6. Relink project files to the (Footage) folder
    await AeScriptsApi.relinkFootage(
      makeNewRelinkData(projectInfo.footage, footageDir),
    ).finally(() =>
      undoStack.unshift(async () => {
        AeScriptsApi.relinkFootage(makeOriginalRelinkData(projectInfo.footage));
      }),
    );

    // 7. Zip the project
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
        dest: 'Fonts',
        isRequired: projectInfo.fonts.length > 0,
      },
    ]);

    return zipPath;
  } finally {
    // 8. Undo all operations in reverse order
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

export { makeProjectZip, makeProjectZipTmpDir, removeFolder, selectFolder };
