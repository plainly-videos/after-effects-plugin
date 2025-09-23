interface ProjectValidation {
  textLayers?: {
    allCaps: {
      layerId: string;
      layerName: string;
      isValid: false;
    }[];
  };
}

function checkTextLayers(): ProjectValidation['textLayers'] | undefined {
  const comps = getAllComps(app.project);
  let layers: Array<TextLayer> = [];

  for (let i = 0; i < comps.length; i++) {
    layers = getTextLayersByComp(comps[i]);
  }

  if (layers.length === 0) return;

  let textLayers: ProjectValidation['textLayers'] | undefined;

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    if (layer.sourceText.value.allCaps) {
      if (!textLayers) {
        textLayers = { allCaps: [] };
      }
      textLayers.allCaps.push({
        layerId: layer.id.toString(),
        layerName: layer.name,
        isValid: false,
      });
    }
  }

  return textLayers;
}

function validateProject(): string {
  const textLayers = checkTextLayers();

  if (textLayers) {
    return JSON.stringify({ textLayers });
  }

  return 'undefined';
}
