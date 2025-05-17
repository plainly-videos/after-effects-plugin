function relinkFootage(): void {
  app.beginUndoGroup('Relink Footage');

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

    if (app.project.file == null) {
      return;
    }

    const projectDir = app.project.file.parent.fsName;
    const aeFolderPath = getFolderPath(item.parentFolder).replace(
      'Root',
      '(Footage)',
    );
    const itemAbsPath = pathJoin(projectDir, aeFolderPath, item.name);
    // check if file exists
    item.replace(new File(itemAbsPath));
  }

  app.endUndoGroup();

  app.project.save();
}

function undoFootage() {
  app.executeCommand(16);
  app.project.save();
}
