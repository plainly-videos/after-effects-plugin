import type { TextLayerIssues } from 'plainly-types';
import { getTextLayersByComp, uuid } from '../utils';
import { ProjectIssueType } from '.';

/**
 * Validates text layers across the provided comps and reports all-caps styling issues.
 *
 * It ignores guide layers, checks legacy `allCaps` first for older After Effects
 * versions, and on AE 24.3+ also inspects `characterRange(...).fontCapsOption`
 * to detect mixed per-character all-caps formatting.
 *
 * @param comps Compositions to scan for text layers.
 * @returns A list of text-layer issues where all-caps formatting is detected.
 */
function validateTextLayers(comps: CompItem[]): TextLayerIssues[] {
  const textLayersIssues: TextLayerIssues[] = [];

  for (let i = 0; i < comps.length; i++) {
    const comp = comps[i];
    const layers = getTextLayersByComp(comp);
    if (layers.length === 0) {
      continue;
    }

    for (let j = 0; j < layers.length; j++) {
      const layer = layers[j];
      if (layer.guideLayer) {
        continue;
      }

      const textDocument = layer.sourceText.value;

      // first check allCaps for older After Effects versions
      // this checks only the first character of the text layer
      // IMPORTANT: with this method, on older versions (< 24.3), we can't fix, but we can at least report it
      if (textDocument.allCaps) {
        textLayersIssues.push({
          id: uuid(),
          type: ProjectIssueType.AllCaps,
          layerId: layer.id.toString(),
          layerName: layer.name,
        });
        continue;
      }

      // if we didn't find allCaps above, check for fontCapsOption (After Effects 24.3+)
      // check if characterRange exists in textDocument (After Effects 24.3+) first
      if (typeof textDocument.characterRange !== 'function') {
        continue;
      }

      let hasCharacterAllCaps = false;
      const range = textDocument.characterRange(0, textDocument.text.length);

      // `range.fontCapsOption === undefined` this means that there are different attributes in the text per character,
      // thus, we can check per-character basis to find if any character is allCaps
      if (range.fontCapsOption === undefined) {
        for (let k = 0; k < textDocument.text.length; k++) {
          const cRange = textDocument.characterRange(k, k + 1);
          if (
            cRange.isRangeValid &&
            cRange.fontCapsOption === FontCapsOption.FONT_ALL_CAPS
          ) {
            hasCharacterAllCaps = true;
            textLayersIssues.push({
              id: uuid(),
              type: ProjectIssueType.AllCaps,
              layerId: layer.id.toString(),
              layerName: layer.name,
            });
            break;
          }
        }
      }

      // if we already found a character with allCaps, skip further checks
      if (hasCharacterAllCaps) {
        continue;
      }

      // if the whole text has the same attribute, we can check it directly
      if (
        range.isRangeValid &&
        range.fontCapsOption === FontCapsOption.FONT_ALL_CAPS
      ) {
        textLayersIssues.push({
          id: uuid(),
          type: ProjectIssueType.AllCaps,
          layerId: layer.id.toString(),
          layerName: layer.name,
        });
      }
    }
  }

  return textLayersIssues;
}

/**
 * Fixes all caps issue for a specific text layer.
 *
 * **NOTE**: Works only on `After Effects 24.3` and later due to the use of `characterRange` method and `fontCapsOption`.
 *
 * @param layerId string
 * @returns void
 */
function fixAllCapsIssue(layerId: string) {
  const layer = app.project.layerByID(parseInt(layerId, 10));
  if (!(layer && layer instanceof TextLayer)) {
    return;
  }

  const textDocument = layer.sourceText.value;

  // check if characterRange exists in textDocument (After Effects 24.3+)
  if (typeof textDocument.characterRange !== 'function') {
    return;
  }

  const newValue = textDocument;

  // fix if entire text has uniform all caps
  const range = newValue.characterRange(0, newValue.text.length);
  if (
    range.isRangeValid &&
    range.fontCapsOption === FontCapsOption.FONT_ALL_CAPS
  ) {
    newValue.fontCapsOption = FontCapsOption.FONT_NORMAL_CAPS;
    updateLayerTextDocument(layer, newValue);
    const existingExprAll = layer.sourceText.expression;
    const baseAll = existingExprAll ? `(${existingExprAll})` : 'value';
    layer.sourceText.expression = `${baseAll}.toUpperCase()`;
    return;
  }

  // fix if only the first character has all caps
  if (newValue.text.length === 0) {
    return;
  }

  const firstCharRange = newValue.characterRange(0, 1);
  if (
    !firstCharRange.isRangeValid ||
    firstCharRange.fontCapsOption !== FontCapsOption.FONT_ALL_CAPS
  ) {
    return;
  }

  for (let i = 1; i < newValue.text.length; i++) {
    const cRange = newValue.characterRange(i, i + 1);
    if (
      cRange.isRangeValid &&
      cRange.fontCapsOption === FontCapsOption.FONT_ALL_CAPS
    ) {
      return; // all caps not limited to first character, don't fix
    }
  }

  newValue.characterRange(0, 1).fontCapsOption =
    FontCapsOption.FONT_NORMAL_CAPS;
  updateLayerTextDocument(layer, newValue);
  const existingExprFirst = layer.sourceText.expression;
  const baseFirst = existingExprFirst ? `(${existingExprFirst})` : 'value';
  layer.sourceText.expression = `var v = ${baseFirst}; v.charAt(0).toUpperCase() + v.slice(1)`;
}

/**
 * Fixes all caps issues for multiple text layers in a single undo group.
 *
 * **NOTE**: Works only on `After Effects 24.3` and later due to the use of `characterRange` method and `fontCapsOption`.
 *
 * @param layerIds Array of layer IDs to fix
 * @returns The name of the undo group created, or undefined if no fixes were applied
 */
function fixAllCapsIssues(layerIds: string[]) {
  app.beginUndoGroup('fix all caps');

  for (const layerId of layerIds) {
    fixAllCapsIssue(layerId);
  }

  app.endUndoGroup();
}

function updateLayerTextDocument(layer: TextLayer, newValue: TextDocument) {
  const originalLayerName = layer.name;
  layer.sourceText.setValue(newValue);
  layer.name = originalLayerName; // Preserve original layer name
}

export { validateTextLayers, fixAllCapsIssue, fixAllCapsIssues };
