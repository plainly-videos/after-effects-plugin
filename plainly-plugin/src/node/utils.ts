import child_process from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const homeDirectory = os.homedir();

// @ts-ignore
import CSInterface from './lib/CSInterface';
const csInterface = new CSInterface();

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
  const p = child_process.spawn('open', [finalizedPath]);

  p.on('error', () => p.kill());
};
