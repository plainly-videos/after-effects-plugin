function checkTextLayers(): TextLayerIssues[] | undefined {
  const comps = getAllComps(app.project);
  let textLayers: TextLayerIssues[] | undefined;

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

      for (let k = 0; k < textDocument.text.length; k++) {
        const characterRange = textDocument.characterRange(k, k + 1);
        if (
          !characterRange.isRangeValid ||
          characterRange.fontCapsOption !== 11014
        ) {
          continue;
        }

        if (!textLayers) {
          textLayers = [];
        }
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

  for (let i = 0; i < newValue.text.length; i++) {
    const characterRange = newValue.characterRange(i, i + 1);
    if (
      !characterRange.isRangeValid ||
      characterRange.fontCapsOption !== 11014
    ) {
      continue;
    }

    newValue.characterRange(i, i + 1).fontCapsOption = 11012;
    newValue.characterRange(i, i + 1).text = newValue
      .characterRange(i, i + 1)
      .text.toUpperCase();
  }

  layer.sourceText.setValue(newValue);
}
