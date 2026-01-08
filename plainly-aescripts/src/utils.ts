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
  const comps: CompItem[] = [];

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
  const layers: TextLayer[] = [];

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

/**
 * Deselects every currently selected layer across all compositions in the active project.
 *
 * Iterates through all `CompItem` instances in `app.project`, aggregates their `selectedLayers`,
 * and sets each layer's `selected` property to `false`.
 *
 * @returns {void}
 */
function unselectAllLayers(): void {
  const comps = getAllComps(app.project);
  let selectedLayers: Layer[] = [];
  for (let i = 0; i < comps.length; i++) {
    const comp = comps[i];
    selectedLayers = selectedLayers.concat(comp.selectedLayers);
  }

  for (let i = 0; i < selectedLayers.length; i++) {
    const layer = selectedLayers[i];
    layer.selected = false;
  }
}

/**
 * Selects a layer in the active project by its numeric ID.
 *
 * Uses `app.project.layerByID` after parsing the provided string to base-10 integer. If a layer
 * with the given ID exists, its `selected` property is set to `true`; otherwise the function exits silently.
 *
 * @param {string} layerId - The string representation of the layer's numeric ID (e.g. value from `Layer.id`).
 * @returns {void}
 * @example
 * // Select a layer whose id is 1234
 * selectLayer('1234');
 */
function selectLayer(layerId: string): void {
  unselectEverythingInTree();
  unselectAllLayers();
  const layer = app.project.layerByID(parseInt(layerId, 10));
  if (layer) {
    // open the comp that contains the layer, so it is visible to the user in timeline
    const comp = layer.containingComp;
    comp.time = layer.inPoint;
    const viewer = comp.openInViewer();
    if (viewer?.active === false) viewer.setActive();

    layer.selected = true;
  }
}

/**
 * Deselects all items in the project panel tree.
 *
 * Iterates through all items in `app.project.items` and sets each item's `selected` property to `false`.
 *
 * @returns {void}
 */
function unselectEverythingInTree(): void {
  for (let i = 1; i <= app.project.numItems; i++) {
    const item = app.project.item(i);
    item.selected = false;
  }
}

/**
 * Selects a composition in the active project by its numeric ID.
 *
 * Uses `app.project.itemByID` after parsing the provided string to base-10 integer. If a composition
 * with the given ID exists, it is opened in a viewer and its `selected` property is set to `true`;
 * otherwise the function exits silently.
 *
 * @param {string} compId - The string representation of the composition's numeric ID (e.g. value from `CompItem.id`).
 * @returns {void}
 * @example
 * // Select a composition whose id is 5678
 * selectComp('5678');
 */
function selectComp(compId: string): void {
  unselectEverythingInTree();
  const comp = app.project.itemByID(parseInt(compId, 10));
  if (comp instanceof CompItem) {
    const viewer = comp.openInViewer();
    comp.selected = true;
    if (viewer?.active === false) {
      viewer.setActive();
    }
  }
}

/**
 * Selects a file item in the active project by its numeric ID.
 *
 * Uses `app.project.itemByID` after parsing the provided string to base-10 integer. If a file
 * with the given ID exists, its `selected` property is set to `true`; otherwise the function exits silently.
 *
 * @param {string} fileId - The string representation of the file's numeric ID (e.g. value from `FootageItem.id`).
 * @returns {void}
 * @example
 * // Select a file whose id is 91011
 * selectFile('91011');
 */
function selectFile(fileId: string): void {
  unselectEverythingInTree();
  const file = app.project.itemByID(parseInt(fileId, 10));
  if (file) {
    file.selected = true;
  }
}

export {
  isWin,
  pathJoin,
  getAllComps,
  getTextLayersByComp,
  getFolderPath,
  selectLayer,
  selectComp,
  selectFile,
};
