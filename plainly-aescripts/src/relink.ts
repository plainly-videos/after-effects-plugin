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

    const itemId = item.id.toString();
    const replacementFilePath = relinkData[itemId];

    if (!replacementFilePath) {
      continue;
    }
    const replacementFile = new File(replacementFilePath);
    if (replacementFile.exists) {
      item.replace(replacementFile);
    }
  }

  app.project.save();
}
