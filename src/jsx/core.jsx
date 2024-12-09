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
 * while keeping the project open and restoring original paths.
 *
 * @param {string} targetPath - The folder where files should be collected.
 * @returns {string|undefined} The name of the collected project folder, or undefined if no project is saved.
 */
function collectFilesWithCache(targetPath) {
  if (app.project.file == null || app.project.dirty) {
    return 'notSaved';
  }

  var originalPaths = {};
  var os = checkOs();
  var osPath = os == 'Windows' ? '\\' : '/';

  // Create target folder structure
  var projectName = app.project.file.name.slice(0, -4);
  var projectDir = new Folder(targetPath + osPath + projectName);
  if (!projectDir.exists) projectDir.create();

  // create fonts folder
  var fontDir = new Folder(projectDir.absoluteURI + osPath + 'Fonts');
  if (!fontDir.exists) fontDir.create();

  // Collect all text layers in all comps
  // and copy font files to the Fonts folder
  var comps = getAllComps(app.project);
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
      var targetFont = new File(
        fontDir.absoluteURI + osPath + fontName + '.' + fontExtension,
      );
      if (!targetFont.exists) {
        var sourceFont = new File(fontLocation);
        if (sourceFont.exists) {
          sourceFont.copy(
            fontDir.absoluteURI + osPath + fontName + '.' + fontExtension,
          );
        }
      }
    }
  }

  // Cache original paths
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

    originalPaths[i] = item.file.fsName;
  }

  var footageDir = new Folder(projectDir.absoluteURI + osPath + '(Footage)');
  if (!footageDir.exists) footageDir.create();

  // Update paths to point to new locations
  for (var index in originalPaths) {
    var indexToNumber = parseInt(index, 10);
    var item = app.project.item(indexToNumber);
    var targetFile = new File(footageDir.absoluteURI + osPath + item.file.name);

    var parentFolder = item.parentFolder;
    if (parentFolder && parentFolder.name !== 'Root') {
      // Create subfolder for parent folder structure
      var subFolder = new Folder(
        footageDir.absoluteURI + osPath + parentFolder.name,
      );
      if (!subFolder.exists) subFolder.create();
      targetFile = new File(subFolder.absoluteURI + osPath + item.file.name);
    }

    // Copy file and update project path
    var sourceFile = new File(originalPaths[indexToNumber]);
    if (sourceFile.exists) {
      sourceFile.copy(targetFile.absoluteURI);
      item.replace(targetFile);
    }
  }

  // Copy project to target folder
  var sourceProject = new File(app.project.file.fsName);
  if (sourceProject.exists) {
    sourceProject.copy(projectDir.absoluteURI + osPath + sourceProject.name);
  }

  // Restore original paths
  for (var index in originalPaths) {
    var indexToNumber = parseInt(index, 10);
    var item = app.project.item(indexToNumber);
    var sourceFile = new File(originalPaths[indexToNumber]);
    if (sourceFile.exists) {
      item.replace(sourceFile);
    }
  }

  // Save the project with restored paths
  app.project.save();

  return projectName;
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

/**
 * @function checkOs
 * @description Determines the OS of the current After Effects instance
 * @returns {string} The current OS, either 'Windows' or 'Mac'
 */
function checkOs() {
  var appOs = $.os.indexOf('Win') != -1 ? 'Windows' : 'Mac';
  return appOs;
}
