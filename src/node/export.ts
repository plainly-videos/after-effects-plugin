const fs = require('node:fs');
const archiver = require('archiver');
const path = require('node:path');
const os = require('node:os');

// @ts-ignore
import CSInterface from '../lib/CSInterface';

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
function collectFiles(targetPath: string, callback: (result: string) => void) {
  csInterface.evalScript(
    `collectFilesWithCache("${targetPath}")`,
    (result: string) => callback(result),
  );
}

const homeDirectory = os.homedir();

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
 * Zips the contents of the targetPath directory, and creates a zip file with the
 * same name as the directory, but with a .zip extension.
 *
 * @param targetPath The path of the directory to zip.
 * @param projectName The name of the project.
 * @param updateStatus A callback function that will be called with updates about the
 * status of the zip operation. The callback will receive an object with the following
 * properties:
 * - title: A string that describes the status of the operation.
 * - type: A string that can be either 'success' or 'error'.
 * - description: An optional string that provides more information about the status.
 */
function zip(
  targetPath: string,
  projectName: string,
  updateStatus: ({
    title,
    type,
    description,
  }: {
    title: string;
    type: 'success' | 'error';
    description?: string;
  }) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (projectName === 'notSaved') {
      updateStatus({
        title: 'Failed to zip',
        type: 'error',
        description: 'Project not saved',
      });
      reject(new Error('Project not saved'));
      return;
    }

    const targetPathExpanded = untildify(targetPath); // Expand '~'
    const targetPathDecoded = decodeURI(`${targetPathExpanded}/${projectName}`); // Decode
    const targetPathResolved = path.resolve(targetPathDecoded); // Normalize and resolve

    // check if the directory exists
    if (!fs.existsSync(targetPathResolved)) {
      updateStatus({
        title: 'Failed to zip',
        type: 'error',
        description: 'Directory does not exist',
      });
      reject(new Error('Directory does not exist'));
      return;
    }

    const outputZipPath = `${targetPathResolved}.zip`;
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`Zipped ${archive.pointer()} total bytes`);
      console.log(`Zip file created at: ${outputZipPath}`);
      updateStatus({
        title: 'Successfully zipped',
        type: 'success',
        description: `Zip file created at: ${outputZipPath}`,
      });
      resolve();
    });

    archive.on('error', (err: unknown) => {
      updateStatus({
        title: 'Failed to zip',
        type: 'error',
        description: err as string,
      });
      reject(err);
    });

    archive.pipe(output);

    // Append the directory content to the archive
    archive.directory(targetPathResolved, false);

    archive.finalize();

    updateStatus({
      title: 'Successfully zipped',
      type: 'success',
      description: `Zip file created at: ${outputZipPath}`,
    });
  });
}

/**
 * Removes the folder at the specified targetPath.
 *
 * @param targetPath The path of the folder to remove.
 */
async function removeFolder(targetPath: string) {
  try {
    await fs.rmSync(untildify(targetPath), { recursive: true, force: true });
    console.log(`Removed ${targetPath}`);
  } catch (error) {
    console.error(error);
  }
}

export { selectFolder, collectFiles, zip, removeFolder };
