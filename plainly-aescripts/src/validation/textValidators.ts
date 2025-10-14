function checkTextLayers(): TextLayerIssues[] | undefined {
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
      // check if characterRange exists in textDocument (After Effects 24.3+)
      if (typeof textDocument.characterRange !== 'function') {
        continue;
      }

      let hasCharacterAllCaps = false;
      const range = textDocument.characterRange(0, textDocument.text.length);
      // this means that there are different attributes in the text per character,
      // thus, we can check per-character basis to find if any character is all-caps
      if (range.fontCapsOption === undefined) {
        for (let k = 0; k < textDocument.text.length; k++) {
          const cRange = textDocument.characterRange(k, k + 1);
          if (cRange.isRangeValid && cRange.fontCapsOption === 11014) {
            hasCharacterAllCaps = true;
            textLayers.push({
              type: 'AllCaps' as ProjectIssueType.AllCaps,
              layerId: layer.id.toString(),
              layerName: layer.name,
              text: true,
            });
            break;
          }
        }
      }

      // if we already found a character with all-caps, skip further checks
      if (hasCharacterAllCaps) {
        continue;
      }

      // if the whole text has the same attribute, we can check it directly
      if (range.isRangeValid && range.fontCapsOption === 11014) {
        textLayers.push({
          type: 'AllCaps' as ProjectIssueType.AllCaps,
          layerId: layer.id.toString(),
          layerName: layer.name,
          text: true,
        });
      }
    }
  }

  return textLayers.length > 0 ? textLayers : undefined;
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
  if (range.isRangeValid && range.fontCapsOption === 11014) {
    newValue.fontCapsOption = 11012;
    newValue.text = newValue.text.toUpperCase();
    layer.sourceText.setValue(newValue);
    return;
  }

  // otherwise, check per-character basis
  for (let i = 0; i < newValue.text.length; i++) {
    const cRange = newValue.characterRange(i, i + 1);
    if (cRange.isRangeValid && cRange.fontCapsOption === 11014) {
      newValue.characterRange(i, i + 1).fontCapsOption = 11012;
      newValue.characterRange(i, i + 1).text = newValue
        .characterRange(i, i + 1)
        .text.toUpperCase();
    }
  }
  layer.sourceText.setValue(newValue);
}
