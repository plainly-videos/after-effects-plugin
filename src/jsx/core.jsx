//@include "./shims.js"

/**
 * Prompts the user to select a folder, which will be used to collect project files.
 *
 * @returns {Folder|string} The selected folder, or undefined as a string if no folder is selected.
 */
function selectFolder() {
  var folder = Folder.selectDialog('Select folder to collect project files:');
  if (folder) return new Folder(folder.fsName); // Return selected folder

  // NOTE: this always returns undefined as a string if no folder is selected
}

/**
 * Collects project files, fonts, and footage into a designated folder,
 *
 * @param {string} targetPath - The folder where files should be collected.
 * @returns {string|undefined} The name of the collected project folder, or undefined if no project is saved.
 */
function collectFiles(targetPath) {
  // save project at the start
  app.project.save();

  var os = checkOs();
  var osPath = os == 'Windows' ? '\\' : '/';

  var filePaths = {
    project: app.project.file.absoluteURI,
    fonts: [],
    footage: [],
  };

  // collect paths
  filePaths.fonts = collectFonts(osPath);
  filePaths.footage = collectFootage(osPath);

  // return full path
  return JSON.stringify(filePaths);
}

/**
 * @function checkOs
 * @description Determines the OS of the current After Effects instance
 * @returns {string} The current OS, either 'Windows' or 'Mac'
 */
function checkOs() {
  var appOs = $.os.indexOf('Win') != -1 ? 'Windows' : 'Mac';
  return appOs;
}

function collectFonts(osPath) {
  var comps = getAllComps(app.project);
  var fontPaths = [];

  for (var i = 0; i < comps.length; i++) {
    var layers = getTextLayersByComp(comps[i]);
    for (var j = 0; j < layers.length; j++) {
      var fontName = layers[j].sourceText.value.font;
      var fontExtension = layers[j].sourceText.value.fontLocation
        .split(osPath)
        .pop();
      if (fontExtension == null) continue;

      fontExtension = fontExtension.split('.').pop();
      var fontLocation = layers[j].sourceText.value.fontLocation;
      fontPaths.push({
        fontName: fontName,
        fontExtension: fontExtension,
        fontLocation: fontLocation,
      });
    }
  }

  return fontPaths;
}

/**
 * @function getAllComps
 * @description Get all comp items in a given After Effects project
 * @param {Object} project - The After Effects project object
 * @returns {Array} An array of CompItem objects
 */
function getAllComps(project) {
  var comps = [];

  for (var i = 1; i <= project.numItems; i++) {
    var item = project.item(i);
    if (item instanceof CompItem) {
      comps.push(item);
    }
  }

  return comps;
}

/**
 * @function getTextLayersByComp
 * @description Get all text layers in a given After Effects comp
 * @param {Object} comp - The After Effects comp object
 * @returns {Array} An array of TextLayer objects
 */
function getTextLayersByComp(comp) {
  var layers = [];

  for (var i = 1; i <= comp.numLayers; i++) {
    var layer = comp.layer(i);
    if (layer instanceof TextLayer) {
      layers.push(layer);
    }
  }

  return layers;
}

function collectFootage(osPath) {
  var footagePaths = [];

  // Go through all items in the project
  for (var i = 1; i <= app.project.numItems; i++) {
    var item = app.project.item(i);
    if (item instanceof FootageItem == false) {
      continue;
    }
    if (item.file == null) {
      continue;
    }
    if (item.footageMissing) {
      continue;
    }

    // Determine the nested folder structure
    var relativePath = getFolderPath(item.parentFolder);

    footagePaths.push({ itemName: item.file.fsName, itemFolder: relativePath });
  }

  return footagePaths;
}

function getFolderPath(folder) {
  // If the folder is the root folder, return an empty string
  if (folder.parentFolder == null || folder == app.project.rootFolder) {
    return folder.name;
  } else {
    // Recursively build the folder path
    var parentPath = getFolderPath(folder.parentFolder);
    return parentPath + '/' + folder.name;
  }
}
