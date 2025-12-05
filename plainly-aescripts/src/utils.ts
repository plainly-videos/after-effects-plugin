/**
 * @function isWin
 * @description Determines if the current OS is Windows
 * @returns {boolean} True if the OS is Windows, false otherwise
 */
function isWin(): boolean {
  return $.os.indexOf('Win') !== -1;
}

/**
 * Joins multiple path segments into a single path string.
 *
 * @param {...string} args - The path segments to join.
 * @returns {string} The combined path string, using the appropriate
 * separator for the current OS ('\\' for Windows, '/' for Mac).
 */
function pathJoin(...args: string[]): string {
  const path = isWin() ? '\\' : '/';
  return args.join(path);
}

/**
 * @function getAllComps
 * @description Get all comp items in a given After Effects project
 * @param {Project} project - The After Effects project object
 * @returns {Array<CompItem>} An array of CompItem objects
 */
function getAllComps(project: Project): Array<CompItem> {
  const comps = [];

  for (let i = 1; i <= project.numItems; i++) {
    const item = project.item(i);
    if (item instanceof CompItem) {
      comps.push(item);
    }
  }

  return comps;
}

/**
 * @function getTextLayersByComp
 * @description Get all text layers in a given After Effects comp
 * @param {CompItem} comp - The After Effects comp object
 * @returns {Array<TextLayer>} An array of TextLayer objects
 */
function getTextLayersByComp(comp: CompItem): Array<TextLayer> {
  const layers = [];

  for (let i = 1; i <= comp.numLayers; i++) {
    const layer = comp.layer(i);
    if (layer instanceof TextLayer) {
      layers.push(layer);
    }
  }

  return layers;
}

function getFolderPath(folder: FolderItem): string {
  if (folder.parentFolder === null || folder === app.project.rootFolder) {
    return '';
  }

  // Recursively build the folder path
  const parentPath = getFolderPath(folder.parentFolder);
  return pathJoin(parentPath, folder.name);
}
