interface RelinkData {
  [itemId: string]: string;
}

function relinkFootage(relinkData: RelinkData): void {
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
    let fullPath = relinkData[itemId];

    if (!fullPath) {
      continue;
    }

    if (isWin() && fullPath.length > 255) {
      fullPath = `\\\\?\\${fullPath}`;
    }

    const replacementFile = new File(fullPath);
    if (replacementFile.exists) {
      item.replace(replacementFile);
    }
  }

  app.project.save();
}
