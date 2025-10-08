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

      if (layer.sourceText.value.allCaps) {
        if (!textLayers) {
          textLayers = [];
        }
        textLayers.push({
          type: 'AllCaps' as ProjectIssueType.AllCaps,
          layerId: layer.id.toString(),
          layerName: layer.name,
          text: true,
        });
      }
    }
  }

  return textLayers;
}

function fixAllCapsIssue(layerId: string) {
  const layer = app.project.layerByID(parseInt(layerId, 10));
  if (!(layer && layer instanceof TextLayer)) return;

  type CapsAware = typeof layer.sourceText.value & { fontCapsOption?: number };
  const val = layer.sourceText.value as CapsAware;
  const isAllCaps = val.fontCapsOption === 11014;
  if (!isAllCaps) return;

  const newValue = val;
  newValue.fontCapsOption = 11012; // FONT_NORMAL_CAPS;
  newValue.text = newValue.text.toUpperCase();
  layer.sourceText.setValue(newValue);
}
