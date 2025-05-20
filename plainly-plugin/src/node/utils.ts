import child_process from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import fsPromises from 'fs/promises';

const homeDirectory = os.homedir();

import archiver from 'archiver';
import { isWindows } from './constants';
// @ts-ignore
import CSInterface from './lib/CSInterface';
const csInterface = new CSInterface();

/**
 * Checks if a file or directory exists at the given path.
 * @param path - The path to check.
 * @returns
 */
export async function exists(path: string): Promise<boolean> {
  try {
    await fsPromises.stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Renames a file or directory if it exists at the given path.
 * @param src Source path to rename.
 * @param dest Destination path to rename to.
 */
export async function renameIfExists(src: string, dest: string): Promise<void> {
  if (!(await exists(src))) {
    // Ignore if the source file doesn't exist
    return;
  }

  await fsPromises.rename(src, dest);
}

/**
 * Replaces the tilde character at the start of a path with the user's home
 * directory.
 *
 * @example
 * untildify('~/Documents') // => '/Users/username/Documents'
 * @param {string} pathWithTilde - The path to transform.
 * @returns {string} The path with the tilde replaced.
 */
export function untildify(pathWithTilde: string): string {
  if (typeof pathWithTilde !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof pathWithTilde}`);
  }

  return homeDirectory
    ? pathWithTilde.replace(/^~(?=$|\/|\\)/, homeDirectory)
    : pathWithTilde;
}

export function finalizePath(entry: string) {
  return path.resolve(decodeURI(untildify(entry)));
}

export function generateFolders(folderPath: string) {
  const pathResolved = path.resolve(decodeURI(untildify(folderPath))); // Normalize and resolve

  if (!fs.existsSync(pathResolved)) {
    fs.mkdirSync(pathResolved, { recursive: true });
  }
}

export async function evalScriptAsync(
  func: string,
): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    try {
      csInterface.evalScript(func, (result: string) => {
        if (result.includes('Error: ')) {
          reject(new Error(result));
        }

        resolve(result === 'undefined' ? undefined : result);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export const runInParallelReturnRejected = async <T>(
  promises: Promise<T>[],
): Promise<string[]> => {
  const results = await Promise.allSettled(promises);

  return results
    .filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    )
    .map(({ reason }) =>
      reason instanceof Error ? reason.message : String(reason),
    );
};

export const openFolder = (path: string) => {
  const finalizedPath = finalizePath(path);
  const command = isWindows ? 'explorer' : 'open';
  const p = child_process.spawn(command, [finalizedPath]);

  p.on('error', () => p.kill());
};

/**
 * Zips the contents of the targetPath directory, and creates a zip file with the
 * project name.
 * Throws an error if the item src does not exist.
 *
 * @param outputZipPath The path to the output zip file.
 * @param items An array of objects containing the source and destination paths.
 */
export const zipItems = async (
  outputZipPath: string,
  items: { src: string; dest: string; isRequired: boolean }[],
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 1 } });

    output.on('close', () => {
      console.log(`Zipped ${archive.pointer()} bytes`);
      console.log(outputZipPath);

      resolve(outputZipPath);
    });

    archive.on('error', (err) => {
      fs.unlinkSync(outputZipPath);
      reject(err);
    });

    archive.pipe(output);

    for (const item of items) {
      try {
        const stats = fs.statSync(item.src);
        if (stats.isFile()) {
          archive.file(item.src, { name: item.dest });
        } else if (stats.isDirectory()) {
          archive.directory(item.src, item.dest);
        }
      } catch (error) {
        if (item.isRequired) {
          throw error;
        }
      }
    }

    archive.finalize();
  });
};
