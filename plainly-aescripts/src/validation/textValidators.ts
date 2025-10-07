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
