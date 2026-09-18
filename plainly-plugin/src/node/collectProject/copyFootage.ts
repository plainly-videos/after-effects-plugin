import fsPromises from 'fs/promises';
import path from 'path';
import type { Footage } from 'plainly-types';
import { CollectFootageError } from '../errors';
import {
  finalizePath,
  generateFolders,
  runInParallelReturnRejected,
} from '../utils';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a matcher for every frame belonging to the same sequence as the given
 * file, based on the trailing frame number in its name (`shot_0001.png` matches
 * `shot_<digits>.png`).
 *
 * @param fileName The name of the first frame of the sequence.
 * @returns A matcher for the sequence frames, or undefined if the name is not numbered.
 */
function sequenceFrameMatcher(fileName: string): RegExp | undefined {
  const extension = path.extname(fileName);
  const baseName = path.basename(fileName, extension);
  const numbered = /^(.*?)(\d+)$/.exec(baseName);

  if (!numbered) {
    return undefined;
  }

  // After Effects groups frames by the exact width of the numeric field, so a zero
  // padded sequence must not pull in differently padded neighbours (`shot_001.png`
  // and `shot_0001.png` are two sequences). Unpadded names grow past their width
  // (`f9.png` -> `f10.png`), so those stay open ended.
  const digits = numbered[2];
  const frameNumber =
    digits.charAt(0) === '0' ? `\\d{${digits.length}}` : '\\d+';

  return new RegExp(
    `^${escapeRegExp(numbered[1])}${frameNumber}${escapeRegExp(extension)}$`,
    'i',
  );
}

/**
 * Copies every frame of an image sequence into the destination folder.
 *
 * NOTE: all frames matching the sequence naming in the source folder are copied,
 * not only the range the project uses. That can make the zip larger than strictly
 * needed, but it keeps the sequence intact.
 *
 * @param firstFrameSrc The path of the first frame of the sequence.
 * @param destDir The folder to copy the frames into.
 */
async function copySequence(firstFrameSrc: string, destDir: string) {
  const srcDir = path.dirname(firstFrameSrc);
  const fileName = path.basename(firstFrameSrc);
  const matcher = sequenceFrameMatcher(fileName);

  if (!matcher) {
    // Not a numbered name after all, treat it as a single file
    await fsPromises.copyFile(firstFrameSrc, path.join(destDir, fileName));
    return;
  }

  const entries = await fsPromises.readdir(srcDir);
  const frames = entries.filter((entry) => matcher.test(entry));

  await Promise.all(
    frames.map((frame) =>
      fsPromises.copyFile(path.join(srcDir, frame), path.join(destDir, frame)),
    ),
  );
}

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

  // Items left on the same destination point at the same source file, copying it
  // once keeps the parallel copies below from writing over each other
  const uniqueFootage = new Map<string, Footage>();
  for (const footageItem of footage) {
    const dest = path.join(
      footageItem.itemAeFolder,
      path.basename(footageItem.itemFsPath),
    );
    const key = dest.toLowerCase();
    // The same file can be in the project both as a sequence and as a single
    // frame, and only the sequence copy brings every frame
    if (!uniqueFootage.get(key)?.isSequence) {
      uniqueFootage.set(key, footageItem);
    }
  }

  const footagePromises = Array.from(uniqueFootage.values()).map(
    async (footageItem) => {
      let src = finalizePath(footageItem.itemFsPath);
      src = src.replace(footageDir, footageDirRenamed);
      const destDir = path.join(newFootageDir, footageItem.itemAeFolder);

      generateFolders(destDir);
      try {
        if (footageItem.isSequence) {
          return await copySequence(src, destDir);
        }
        const footageName = path.basename(footageItem.itemFsPath);
        return await fsPromises.copyFile(src, path.join(destDir, footageName));
      } catch {
        throw new Error(src);
      }
    },
  );

  const errors = await runInParallelReturnRejected(footagePromises);
  if (errors.length > 0) {
    throw new CollectFootageError(errors);
  }
}
