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

export { validateTextLayers };
