import type { RelinkData } from 'plainly-types';
import { isWin } from './utils';

function relinkFootage(relinkData: RelinkData) {
  const failed: string[] = [];

  for (let i = 1; i <= app.project.numItems; i++) {
    const item = app.project.item(i);
    if (!(item instanceof FootageItem)) {
      continue;
    }
    if (!(item.mainSource instanceof FileSource)) {
      continue;
    }

    const originalFile = item.mainSource.file;
    if (!originalFile) {
      continue;
    }

    // Important: Skip PSD (Photoshop) and AI (illustrator) files
    const name = originalFile.fsName.toLowerCase();
    if (
      name.substring(name.length - 4) === '.psd' ||
      name.substring(name.length - 3) === '.ai'
    ) {
      continue;
    }

    const itemId = item.id.toString();
    const relinkItem = relinkData[itemId];

    if (!relinkItem) {
      continue;
    }

    let fullPath = relinkItem.path;

    if (isWin() && fullPath.length > 255) {
      fullPath = `\\\\?\\${fullPath}`;
    }

    const replacementFile = new File(fullPath);
    if (replacementFile.exists) {
      // Important: a single item must never abort the loop. This same function
      // restores the original links on the way out, and a throw there would leave
      // the remaining items pointing at the temporary (Footage) folder that is
      // deleted right after, without ever reaching the save below.
      try {
        if (relinkItem.isSequence) {
          // Important: replace() imports a single still, which collapses an image
          // sequence to one frame. The path points at the first frame, and the rest
          // of the sequence is picked up from the same folder in numbered order.
          item.replaceWithSequence(replacementFile, false);
        } else {
          item.replace(replacementFile);
        }
      } catch (e) {
        failed.push(item.name);
      }
    }
  }

  app.project.save();

  if (failed.length > 0) {
    return `Error: Could not relink the following items: ${failed.join(', ')}`;
  }
}

export { relinkFootage };
