import path from 'path';
import fsPromises from 'fs/promises';
import { CollectFootageError } from '../errors';
import type { Footage } from '../types';
import {
  finalizePath,
  generateFolders,
  runInParallelReturnRejected,
} from '../utils';

export async function copyFootage(
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
