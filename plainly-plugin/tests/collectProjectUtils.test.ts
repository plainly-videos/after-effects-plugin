import path from 'path';
import type { Footage } from 'plainly-types';

// The bridge instantiates CSInterface at module load, which needs the CEP host
jest.mock('../src/node/bridge', () => ({ AeScriptsApi: {} }));

import { resolveFootageFolders } from '../src/node/collectProject/utils';

let nextItemId = 1;

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

function folders(items: Footage[]) {
  return resolveFootageFolders(items).map((item) => item.itemAeFolder);
}

describe('resolveFootageFolders', () => {
  it('moves a colliding basename into a numbered subfolder', () => {
    expect(
      folders([
        footage('/a/logo.png', 'Assets'),
        footage('/b/logo.png', 'Assets'),
      ]),
    ).toEqual(['Assets', path.join('Assets', '(2)')]);
  });

  it('lets items pointing at the same file share a destination', () => {
    expect(
      folders([
        footage('/a/logo.png', 'Assets'),
        footage('/a/logo.png', 'Assets'),
      ]),
    ).toEqual(['Assets', 'Assets']);
  });

  it('separates names differing only in case', () => {
    expect(
      folders([
        footage('/a/Logo.png', 'Assets'),
        footage('/b/logo.png', 'Assets'),
      ]),
    ).toEqual(['Assets', path.join('Assets', '(2)')]);
  });

  it('keeps stills that merely look numbered together', () => {
    expect(
      folders([
        footage('/a/img_1.png', 'Assets'),
        footage('/b/img_2.png', 'Assets'),
      ]),
    ).toEqual(['Assets', 'Assets']);
  });

  it('gives a sequence its whole frame numbering', () => {
    expect(
      folders([
        footage('/a/shot_0001.png', 'Assets', true),
        footage('/b/shot_0050.png', 'Assets'),
      ]),
    ).toEqual(['Assets', path.join('Assets', '(2)')]);
  });

  it('counts the subfolder up past an occupied one', () => {
    expect(
      folders([
        footage('/a/logo.png', 'Assets'),
        footage('/b/logo.png', 'Assets'),
        footage('/c/logo.png', 'Assets'),
      ]),
    ).toEqual([
      'Assets',
      path.join('Assets', '(2)'),
      path.join('Assets', '(3)'),
    ]);
  });

  it('leaves a shared basename in different folders alone', () => {
    expect(
      folders([
        footage('/a/logo.png', 'Assets'),
        footage('/b/logo.png', 'Other'),
      ]),
    ).toEqual(['Assets', 'Other']);
  });

  // Padding is not part of the family name, so differently padded sequences are
  // kept apart although they could never write over each other
  it('separates differently padded sequences', () => {
    expect(
      folders([
        footage('/a/shot_001.png', 'Assets', true),
        footage('/b/shot_0001.png', 'Assets', true),
      ]),
    ).toEqual(['Assets', path.join('Assets', '(2)')]);
  });

  it('bumps a sequence arriving after a still of the same numbering', () => {
    expect(
      folders([
        footage('/a/img_1.png', 'Assets'),
        footage('/b/img_7.png', 'Assets', true),
      ]),
    ).toEqual(['Assets', path.join('Assets', '(2)')]);
  });

  it('keeps a numbering claimed once the same file comes back as a still', () => {
    expect(
      folders([
        footage('/a/img_1.png', 'Assets', true),
        footage('/a/img_1.png', 'Assets'),
        footage('/b/img_9.png', 'Assets'),
      ]),
    ).toEqual(['Assets', 'Assets', path.join('Assets', '(2)')]);
  });

  it('claims the numbering an unpadded sequence grows into', () => {
    expect(
      folders([
        footage('/a/f9.png', 'Assets', true),
        footage('/b/f10.png', 'Assets'),
      ]),
    ).toEqual(['Assets', path.join('Assets', '(2)')]);
  });

  it('reads a numbering on a name without an extension', () => {
    expect(
      folders([
        footage('/a/render_001', 'Assets', true),
        footage('/b/render_002', 'Assets'),
      ]),
    ).toEqual(['Assets', path.join('Assets', '(2)')]);
  });

  it('returns new items and leaves the given ones alone', () => {
    const items = [
      footage('/a/logo.png', 'Assets'),
      footage('/b/logo.png', 'Assets'),
    ];

    const resolved = resolveFootageFolders(items);

    expect(resolved[1]).not.toBe(items[1]);
    expect(items.map((item) => item.itemAeFolder)).toEqual([
      'Assets',
      'Assets',
    ]);
  });

  it('takes an empty list', () => {
    expect(resolveFootageFolders([])).toEqual([]);
  });
});
