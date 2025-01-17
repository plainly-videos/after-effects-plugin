/**
 * Prompts the user to select a folder, which will be used to collect project files.
 *
 * @returns {Folder|string} The selected folder, or undefined as a string if no folder is selected.
 */
function selectFolder(): Folder | string {
  const folder = Folder.selectDialog('Select folder to collect project files:');
  if (folder) return new Folder(folder.fsName); // Return selected folder

  // NOTE: this always returns undefined as a string if no folder is selected
}

/**
 * Collects project files, fonts, and footage into a designated folder,
 *
 * @returns {string|undefined} The name of the collected project folder, or undefined if no project is saved.
 */
function collectFiles(): string | undefined {
  // save project at the start
  app.project.save();

  const filePaths = {
    fonts: [],
    footage: [],
  };

  // collect paths
  filePaths.fonts = collectFonts();
  filePaths.footage = collectFootage();

  // return full path
  return JSON.stringify(filePaths);
}

function collectFonts() {
  const comps = getAllComps(app.project);
  const fontPaths = [];

  for (let i = 0; i < comps.length; i++) {
    const layers = getTextLayersByComp(comps[i]);
    for (let j = 0; j < layers.length; j++) {
      const fontName = layers[j].sourceText.value.font;
      const fontExtension = new File(
        layers[j].sourceText.value.fontLocation,
      ).name
        .split('.')
        .pop();

      const fontLocation = layers[j].sourceText.value.fontLocation;
      fontPaths.push({
        fontName: fontName,
        fontExtension: fontExtension,
        fontLocation: fontLocation,
      });
    }
  }

  return fontPaths;
}

function collectFootage() {
  const footagePaths = [];

  // Go through all items in the project
  for (let i = 1; i <= app.project.numItems; i++) {
    const item = app.project.item(i);
    if (item instanceof FootageItem === false) {
      continue;
    }
    if (item.file == null) {
      continue;
    }
    if (item.footageMissing) {
      continue;
    }

    // Determine the nested folder structure
    const relativePath = getFolderPath(item.parentFolder);

    footagePaths.push({ itemName: item.file.fsName, itemFolder: relativePath });
  }

  return footagePaths;
}
