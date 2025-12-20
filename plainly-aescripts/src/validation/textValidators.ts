import { getAllComps, getTextLayersByComp } from '../utils';
import { ProjectIssueType, type TextLayerIssues } from './types';

function checkTextLayers(): TextLayerIssues[] {
  const comps = getAllComps(app.project);
  const textLayers: TextLayerIssues[] = [];

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
        textLayers.push({
          type: ProjectIssueType.AllCaps,
          layerId: layer.id.toString(),
          layerName: layer.name,
          text: true,
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
            textLayers.push({
              type: ProjectIssueType.AllCaps,
              layerId: layer.id.toString(),
              layerName: layer.name,
              text: true,
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
        textLayers.push({
          type: ProjectIssueType.AllCaps,
          layerId: layer.id.toString(),
          layerName: layer.name,
          text: true,
        });
      }
    }
  }

  return textLayers;
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

  // first check if the whole text has the same attribute
  const range = newValue.characterRange(0, newValue.text.length);
  if (
    range.isRangeValid &&
    range.fontCapsOption === FontCapsOption.FONT_ALL_CAPS
  ) {
    newValue.fontCapsOption = FontCapsOption.FONT_NORMAL_CAPS;
    newValue.text = newValue.text.toUpperCase();
    layer.sourceText.setValue(newValue);
    return;
  }

  // otherwise, check per-character basis
  for (let i = 0; i < newValue.text.length; i++) {
    const cRange = newValue.characterRange(i, i + 1);
    if (
      cRange.isRangeValid &&
      cRange.fontCapsOption === FontCapsOption.FONT_ALL_CAPS
    ) {
      newValue.characterRange(i, i + 1).fontCapsOption =
        FontCapsOption.FONT_NORMAL_CAPS;
      newValue.characterRange(i, i + 1).text = newValue
        .characterRange(i, i + 1)
        .text.toUpperCase();
    }
  }
  layer.sourceText.setValue(newValue);
}

export { checkTextLayers, fixAllCapsIssue };
