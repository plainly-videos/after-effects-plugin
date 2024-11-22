const fs = require('node:fs');
const archiver = require('archiver');
const path = require('node:path');
const os = require('node:os');

// @ts-ignore
import CSInterface from '../lib/CSInterface';

const csInterface = new CSInterface();

function selectFolder(callback: (result: string) => void) {
  csInterface.evalScript('selectFolder()', (result: string) =>
    callback(result),
  );
}

function collectFiles(targetPath: string, callback: (result: string) => void) {
  csInterface.evalScript(`collectFiles("${targetPath}")`, (result: string) =>
    callback(result),
  );
}

const homeDirectory = os.homedir();

function untildify(pathWithTilde: string) {
  if (typeof pathWithTilde !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof pathWithTilde}`);
  }

  return homeDirectory
    ? pathWithTilde.replace(/^~(?=$|\/|\\)/, homeDirectory)
    : pathWithTilde;
}

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
) {
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
  }

  const outputZipPath = `${targetPathResolved}.zip`;
  const output = fs.createWriteStream(outputZipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`Zipped ${archive.pointer()} total bytes`);
    console.log(`Zip file created at: ${outputZipPath}`);
  });

  archive.on('error', (err: unknown) => {
    updateStatus({
      title: 'Failed to zip',
      type: 'error',
      description: err as string,
    });
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
}

export { selectFolder, collectFiles, zip };
