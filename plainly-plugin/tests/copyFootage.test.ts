import fs from 'fs';
import fsPromises from 'fs/promises';
import os from 'os';
import path from 'path';
import type { Footage } from 'plainly-types';

// node/utils and the bridge reach for the CEP host, which is not there in a test
jest.mock('../src/node/constants', () => ({ isWindows: false }));
jest.mock('../src/node/bridge', () => ({ AeScriptsApi: {} }));

import { copyFootage } from '../src/node/collectProject/copyFootage';
import { resolveFootageFolders } from '../src/node/collectProject/utils';
import { CollectFootageError } from '../src/node/errors';

let root: string;
let aepDir: string;
let srcDir: string;
let nextItemId = 1;

beforeEach(async () => {
  root = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'plainly-footage-'));
  aepDir = path.join(root, 'project');
  srcDir = path.join(root, 'sources');
  await fsPromises.mkdir(aepDir);
  await fsPromises.mkdir(srcDir);
});

afterEach(async () => {
  await fsPromises.rm(root, { recursive: true, force: true });
});

function footage(
  itemFsPath: string,
  itemAeFolder: string,
  isSequence = false,
): Footage {
  return {
    itemId: nextItemId++,
    itemName: path.basename(itemFsPath),
    itemFsPath,
    itemAeFolder,
    isMissing: false,
    isSequence,
  };
}

/** Writes `names` into `<sources>/<dir>`, each holding its own path as content. */
function writeSources(dir: string, names: string[]): string[] {
  const folder = path.join(srcDir, dir);
  fs.mkdirSync(folder, { recursive: true });
  return names.map((name) => {
    const file = path.join(folder, name);
    fs.writeFileSync(file, `${dir}/${name}`);
    return file;
  });
}

/** Runs copyFootage with the (Footage) rename left as a no-op. */
function collect(items: Footage[]) {
  return copyFootage(
    items,
    aepDir,
    path.join(aepDir, '(Footage)'),
    path.join(aepDir, 'renamed-(Footage)'),
  );
}

function collected(...segments: string[]): string[] {
  return fs.readdirSync(path.join(aepDir, '(Footage)', ...segments)).sort();
}

function contentOf(...segments: string[]): string {
  return fs.readFileSync(path.join(aepDir, '(Footage)', ...segments), 'utf8');
}

describe('copyFootage', () => {
  it('copies the sequence when the same file is also in as a still', async () => {
    const [firstFrame] = writeSources('seq', [
      'img_0001.png',
      'img_0002.png',
      'img_0003.png',
    ]);

    await collect([
      footage(firstFrame, 'Assets'),
      footage(firstFrame, 'Assets', true),
    ]);

    expect(collected('Assets')).toEqual([
      'img_0001.png',
      'img_0002.png',
      'img_0003.png',
    ]);
  });

  it('copies the sequence when the still comes second', async () => {
    const [firstFrame] = writeSources('seq', ['img_0001.png', 'img_0002.png']);

    await collect([
      footage(firstFrame, 'Assets', true),
      footage(firstFrame, 'Assets'),
    ]);

    expect(collected('Assets')).toEqual(['img_0001.png', 'img_0002.png']);
  });

  it('keeps a padded sequence out of a differently padded one', async () => {
    const [firstFrame] = writeSources('padded', [
      'shot_001.png',
      'shot_002.png',
      'shot_0001.png',
    ]);

    await collect([footage(firstFrame, 'Assets', true)]);

    expect(collected('Assets')).toEqual(['shot_001.png', 'shot_002.png']);
  });

  it('lets an unpadded sequence grow past its frame width', async () => {
    const [firstFrame] = writeSources('unpadded', [
      'f9.png',
      'f10.png',
      'f100.png',
    ]);

    await collect([footage(firstFrame, 'Assets', true)]);

    expect(collected('Assets')).toEqual(['f10.png', 'f100.png', 'f9.png']);
  });

  it('copies a sequence with an unnumbered name as a single file', async () => {
    const [logo] = writeSources('still', ['logo.png', 'logo2.png']);

    await collect([footage(logo, 'Assets', true)]);

    expect(collected('Assets')).toEqual(['logo.png']);
  });

  it('keeps footage sharing a name in the same folder apart', async () => {
    const [fromA] = writeSources('a', ['logo.png']);
    const [fromB] = writeSources('b', ['logo.png']);

    await collect(
      resolveFootageFolders([
        footage(fromA, 'Assets'),
        footage(fromB, 'Assets'),
      ]),
    );

    expect(contentOf('Assets', 'logo.png')).toBe('a/logo.png');
    expect(contentOf('Assets', '(2)', 'logo.png')).toBe('b/logo.png');
  });

  it('reads footage out of the renamed (Footage) folder', async () => {
    const nested = path.join(aepDir, 'renamed-(Footage)', 'Assets');
    fs.mkdirSync(nested, { recursive: true });
    fs.writeFileSync(path.join(nested, 'old.png'), 'already collected');

    await collect([
      footage(path.join(aepDir, '(Footage)', 'Assets', 'old.png'), 'Assets'),
    ]);

    expect(contentOf('Assets', 'old.png')).toBe('already collected');
  });

  it('reports the sources it could not copy', async () => {
    const [present] = writeSources('a', ['logo.png']);
    const missing = path.join(srcDir, 'a', 'gone.png');

    await expect(
      collect([footage(present, 'Assets'), footage(missing, 'Assets')]),
    ).rejects.toThrow(CollectFootageError);

    expect(collected('Assets')).toEqual(['logo.png']);
  });
});
