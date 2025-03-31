type SelectedLayer = {
  id: number;
  name: string;
  textType: 'point' | 'box';
};

function getSelectedLayers(type: 'text' | 'all') {
  const selectedLayers: SelectedLayer[] = [];

  for (let i = 1; i <= app.project.numItems; i++) {
    const item = app.project.item(i);
    if (item instanceof CompItem) {
      for (let j = 0; j < item.selectedLayers.length; j++) {
        if (type === 'text' && !(item.selectedLayers[j] instanceof TextLayer)) {
          continue;
        }

        const layer = item.selectedLayers[j] as TextLayer;

        if (layer.selected && layer.sourceText) {
          const textType = layer.sourceText.value.pointText ? 'point' : 'box';

          selectedLayers.push({
            id: layer.id,
            name: layer.name,
            textType,
          });
        }
      }
    }
  }

  return JSON.stringify(selectedLayers);
}

function getAllLayers(type: 'text' | 'all') {
  const layers = [];

  for (let i = 1; i <= app.project.numItems; i++) {
    const item = app.project.item(i);
    if (item instanceof CompItem) {
      for (let j = 0; j < item.numLayers; j++) {
        if (type === 'text' && !(item.layer(j + 1) instanceof TextLayer)) {
          continue;
        }

        const textLayer = item.layer(j + 1) as TextLayer;
        if (textLayer.sourceText) {
          const textType = textLayer.sourceText.value.pointText
            ? 'point'
            : 'box';

          layers.push({
            id: textLayer.id,
            name: textLayer.name,
            textType,
          });
        }
      }
    }
  }

  return JSON.stringify(layers);
}

function applyTextAutoscale(toAllLayers: string) {
  const booleanToAllLayers = toAllLayers === 'true';
  let layersToAutoScale = [];

  if (booleanToAllLayers) {
    layersToAutoScale = JSON.parse(getAllLayers('all')) as SelectedLayer[];
  } else {
    layersToAutoScale = JSON.parse(
      getSelectedLayers('text'),
    ) as SelectedLayer[];
  }

  if (!layersToAutoScale) return;

  for (const layer of layersToAutoScale) {
    const textLayer = app.project.layerByID(layer.id) as TextLayer;
    if (layer.textType === 'point') {
      const transform = textLayer.property('Transform') as _TransformGroup;
      if (transform) {
        const originalWidth = textLayer.sourceRectAtTime(
          textLayer.startTime,
          false,
        ).width;

        const autoScalePointText = `
var textWidth = sourceRectAtTime(0, false).width;
var scaleLimit = (${originalWidth}/textWidth) * 100;
var fixedScale = scaleLimit > 100 ? 100 : scaleLimit;
[fixedScale, fixedScale]
`;

        transform.scale.expression = autoScalePointText;
      }
    }
    if (layer.textType === 'box') {
      const transform = textLayer.property('Transform') as _TransformGroup;
      if (transform) {
        const autoScaleBoxText = `
top = sourceRectAtTime().top;
left = sourceRectAtTime().left;
x = left;
y = top;
[x, y]
`;

        transform.anchorPoint.expression = autoScaleBoxText;
      }
    }
  }
}
