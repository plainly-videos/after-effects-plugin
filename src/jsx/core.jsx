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
 * Collects all project files, fonts, and footage into a designated folder.
 *
 * @param {string} targetPath - The path to the folder where the project files should be collected.
 * @returns {string} The name of the collected project folder, or undefined if no project file exists.
 */
function collectFiles(targetPath) {
  var os = checkOs();
  var osPath = os == 'Windows' ? '\\' : '/';

  if (!app.project.file) {
    return;
  }

  // extract project name, removing the .ae
  var projectName = app.project.file.name.slice(0, -4);
  var projectDir = new Folder(targetPath.toString() + osPath + projectName);
  if (!projectDir.exists) projectDir.create();

  // copy project file to new location
  // open copied project
  // save project
  var projectFile = new File(
    projectDir.absoluteURI + osPath + app.project.file.name,
  );
  app.project.file.copy(projectFile);
  app.open(projectFile);
  app.project.save();

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

  // create footage directory
  var footageDir = new Folder(projectDir.absoluteURI + osPath + '(Footage)');
  footageDir.create();

  // go through all items in project
  for (var i = 1; i <= app.project.numItems; i++) {
    var item = app.project.item(i);

    // Check these before continuing.
    if (
      item instanceof FootageItem == false ||
      item.file == null ||
      item.footageMissing
    ) {
      continue;
    }

    // create item folder
    var itemFolder = item.parentFolder.name;
    var targetDir;
    if (itemFolder == 'Root') {
      targetDir = new Folder(footageDir.absoluteURI + osPath);
    } else {
      targetDir = new Folder(footageDir.absoluteURI + osPath + itemFolder);
    }
    if (!targetDir.exists) targetDir.create();

    // create targetFile
    var targetFile = new File(targetDir.absoluteURI + osPath + item.file.name);
    if (targetFile.exists) {
      continue;
    }

    // If the target is a still.
    if (item.mainSource.isStill) {
      item.file.copy(targetFile.absoluteURI);
      item.replace(targetFile);
      continue;
    }

    // list of still image extensions
    var stillExtensions = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'bmp',
      'svg',
      'webp',
      'ico',
      'tif',
      'tiff',
      'eps',
      'raw',
      'ai',
      'ps',
      'indd',
      'pdf',
      'xcf',
      'sketch',
      'xd',
      'cin',
      'dpx',
      'exr',
      'pxr',
      'rla',
      'hdr',
      'tga',
    ];

    // Get item's extension. Will be used to differentiate between image sequences and other media.
    var itemExtension = item.file.name
      .substring(item.file.name.lastIndexOf('.') + 1)
      .toLowerCase();

    // If it's a video file (doesn't contain an image extension)
    if (stillExtensions.indexOf(itemExtension) == -1) {
      item.file.copy(targetDir.absoluteURI + osPath + item.file.name);
      item.replace(targetFile);
      continue;
    }

    // If it's a image sequence.
    if (stillExtensions.indexOf(itemExtension) != -1) {
      var sourceFolder = item.file.parent;
      var frames = sourceFolder.getFiles();

      for (f = 0; f < frames.length; f++) {
        frame = frames[f];
        frame.copy(targetDir.toString() + osPath + frame.name);
      }

      try {
        item.replaceWithSequence(targetFile, true);
      } catch (e) {
        alert(item.name);
      }
    }
  }

  // save the project at the end
  app.project.save();

  // open recent project to go back to the original project
  app.executeCommand(2331);

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
