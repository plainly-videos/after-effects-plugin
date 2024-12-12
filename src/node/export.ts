const fs = require('node:fs');
const archiver = require('archiver');
const path = require('node:path');
const os = require('node:os');

// @ts-ignore
import CSInterface from '../lib/CSInterface';

const csInterface = new CSInterface();
const homeDirectory = os.homedir();

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
function collectFiles(
  targetPath: string,
  callback: (result: string) => Promise<void>,
) {
  csInterface.evalScript(`collectFiles("${targetPath}")`, callback);
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
function untildify(pathWithTilde: string): string {
  if (typeof pathWithTilde !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof pathWithTilde}`);
  }

  return homeDirectory
    ? pathWithTilde.replace(/^~(?=$|\/|\\)/, homeDirectory)
    : pathWithTilde;
}

/**
 * Zips the contents of the zipPath directory, and creates a zip file with the
 * same name as the directory, but with a .zip extension.
 *
 * @param zipPath The path of the directory to zip.
 */
function zip(zipPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const pathExpanded = untildify(zipPath); // Expand '~'
    const pathDecoded = decodeURI(pathExpanded); // Decode
    const pathResolved = path.resolve(pathDecoded); // Normalize and resolve

    // check if the directory exists
    if (!fs.existsSync(pathResolved)) {
      reject(new Error('Directory does not exist'));
      return;
    }

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
  const pathExpanded = untildify(targetPath); // Expand '~'
  const pathDecoded = decodeURI(pathExpanded); // Decode
  const pathResolved = path.resolve(pathDecoded); // Normalize and resolve

  try {
    await fs.rmSync(pathResolved, { recursive: true, force: true });
    console.log(`Removed ${path}`);
  } catch (error) {
    console.error(error);
  }
}

export { collectFiles, removeFolder, selectFolder, zip };
