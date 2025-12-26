import fsPromises from 'fs/promises';
import path from 'path';
import type { Footage } from 'plainly-types';
import { CollectFootageError } from '../errors';
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
    let src = finalizePath(footageItem.itemFsPath);
    src = src.replace(footageDir, footageDirRenamed);
    const footageName = path.basename(footageItem.itemFsPath);
    const folder = footageItem.itemAeFolder;

    generateFolders(path.join(newFootageDir, folder));
    const dest = path.join(newFootageDir, folder, footageName);
    try {
      return await fsPromises.copyFile(src, dest);
    } catch {
      throw new Error(src);
    }
  });

  const errors = await runInParallelReturnRejected(footagePromises);
  if (errors.length > 0) {
    throw new CollectFootageError(errors);
  }
}
