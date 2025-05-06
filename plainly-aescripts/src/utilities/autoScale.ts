type SelectedLayer =
  | {
      id: number;
      name: string;
      text: true;
      asset?: never;
      textType: 'point' | 'box';
    }
  | {
      id: number;
      name: string;
      text?: never;
      asset: true;
      textType?: never;
    };

function isTextLayer(type: string, layer: Layer): layer is TextLayer {
  return type === 'text' && layer instanceof TextLayer;
}

function isAssetLayer(type: string, layer: Layer): layer is AVLayer {
  return type === 'asset' && layer instanceof AVLayer;
}

function getSelectedLayers(type: 'text' | 'asset') {
  const selectedLayers: SelectedLayer[] = [];

  for (let i = 1; i <= app.project.numItems; i++) {
    const item = app.project.item(i);
    if (item instanceof CompItem) {
      for (let j = 0; j < item.selectedLayers.length; j++) {
        const layer = item.selectedLayers[j];

        if (isTextLayer(type, layer)) {
          const textLayer = layer as TextLayer;

          if (textLayer.selected && textLayer.sourceText) {
            const textType = textLayer.sourceText.value.pointText
              ? 'point'
              : 'box';

            selectedLayers.push({
              id: textLayer.id,
              name: textLayer.name,
              text: true,
              textType,
            });
          }
        }

        if (isAssetLayer(type, layer)) {
          const avLayer = item.layer(j + 1) as AVLayer;
          if (avLayer.source instanceof CompItem) {
            continue;
          }

          if (avLayer.source.mainSource instanceof FileSource) {
            if (avLayer.source.mainSource.isStill) {
              selectedLayers.push({
                id: avLayer.id,
                name: avLayer.name,
                asset: true,
              });
            }

            if (!avLayer.source.mainSource.isStill) {
              selectedLayers.push({
                id: avLayer.id,
                name: avLayer.name,
                asset: true,
              });
            }
          }
        }
      }
    }
  }

  return JSON.stringify(selectedLayers);
}

function getAllLayers(type: 'text' | 'asset') {
  const layers: SelectedLayer[] = [];

  for (let i = 1; i <= app.project.numItems; i++) {
    const item = app.project.item(i);
    if (item instanceof CompItem) {
      for (let j = 0; j < item.numLayers; j++) {
        const layer = item.layer(j + 1);

        if (isTextLayer(type, layer)) {
          const textLayer = item.layer(j + 1) as TextLayer;

          if (textLayer.sourceText) {
            const textType = textLayer.sourceText.value.pointText
              ? 'point'
              : 'box';

            layers.push({
              id: textLayer.id,
              name: textLayer.name,
              text: true,
              textType,
            });
          }
        }

        if (isAssetLayer(type, layer)) {
          const avLayer = item.layer(j + 1) as AVLayer;

          if (avLayer.source instanceof CompItem) {
            continue;
          }

          if (avLayer.source.mainSource instanceof FileSource) {
            if (avLayer.source.mainSource.isStill) {
              layers.push({
                id: avLayer.id,
                name: avLayer.name,
                asset: true,
              });
            }

            if (!avLayer.source.mainSource.isStill) {
              layers.push({
                id: avLayer.id,
                name: avLayer.name,
                asset: true,
              });
            }
          }
        }
      }
    }
  }

  return JSON.stringify(layers);
}

function applyTextAutoScale(toAllLayers: string, width: string) {
  const booleanToAllLayers = toAllLayers === 'true';
  const layersToAutoScale: SelectedLayer[] = booleanToAllLayers
    ? JSON.parse(getAllLayers('text'))
    : JSON.parse(getSelectedLayers('text'));

  if (!layersToAutoScale) return;

  for (const layer of layersToAutoScale) {
    const textLayer = app.project.layerByID(layer.id) as TextLayer;

    if (layer.text && layer.textType === 'point') {
      const transform = textLayer.property('Transform') as _TransformGroup;
      if (transform) {
        const originalWidth = textLayer.sourceRectAtTime(
          textLayer.startTime,
          false,
        ).width;

        const widthToUse = width !== 'undefined' ? width : originalWidth;

        const autoScalePointText = `
textWidth = sourceRectAtTime(0, false).width;
scaleLimit = (${widthToUse}/textWidth) * 100;
fixedScale = scaleLimit > 100 ? 100 : scaleLimit;
[fixedScale, fixedScale]
`.trim();

        transform.scale.expression = autoScalePointText;
      }
    }

    if (layer.text && layer.textType === 'box') {
      const transform = textLayer.property('Transform') as _TransformGroup;
      const autoScaleBoxText = `
top = sourceRectAtTime().top;
left = sourceRectAtTime().left;
x = left;
y = top;
[x, y]
`.trim();

      transform.anchorPoint.expression = autoScaleBoxText;
    }
  }
}

function removeTextAutoScale(toAllLayers: string) {
  const booleanToAllLayers = toAllLayers === 'true';
  let layersToProcess = [];

  if (booleanToAllLayers) {
    layersToProcess = JSON.parse(getAllLayers('text')) as SelectedLayer[];
  } else {
    layersToProcess = JSON.parse(getSelectedLayers('text')) as SelectedLayer[];
  }

  if (!layersToProcess) return;

  for (const layer of layersToProcess) {
    const textLayer = app.project.layerByID(layer.id) as TextLayer;

    if (layer.text && layer.textType === 'point') {
      const transform = textLayer.property('Transform') as _TransformGroup;
      transform.scale.expression = '';
    }

    if (layer.text && layer.textType === 'box') {
      const transform = textLayer.property('Transform') as _TransformGroup;
      transform.anchorPoint.expression = '';
    }
  }
}

function applyAssetAutoScale(toAllLayers: string) {
  const booleanToAllLayers = toAllLayers === 'true';
  const layersToAutoScale: SelectedLayer[] = booleanToAllLayers
    ? JSON.parse(getAllLayers('asset'))
    : JSON.parse(getSelectedLayers('asset'));

  if (!layersToAutoScale) return;

  for (const layer of layersToAutoScale) {
    const avLayer = app.project.layerByID(layer.id) as AVLayer;
    if (layer.asset) {
      const height = avLayer.sourceRectAtTime(avLayer.startTime, false).height;
      const width = avLayer.sourceRectAtTime(avLayer.startTime, false).width;
      const scale = avLayer.scale.value;

      const [frameWidth, frameHeight] = [
        (width * scale[0]) / 100,
        (height * scale[1]) / 100,
      ];

      const transform = avLayer.property('Transform') as _TransformGroup;
      const autoScaleAsset = `
newWidth = sourceRectAtTime(0, false).width;
newHeight = sourceRectAtTime(0, false).height;
widthRatio = ${frameWidth} / newWidth;
heightRatio = ${frameHeight} / newHeight;

fixedScale;

if (widthRatio > heightRatio) {
  fixedScale = heightRatio * 100;
} else {
  fixedScale = widthRatio * 100;
}

[fixedScale, fixedScale]
      `.trim();

      transform.scale.expression = autoScaleAsset;
    }
  }
}

function removeAssetAutoScale(toAllLayers: string) {
  const booleanToAllLayers = toAllLayers === 'true';
  let layersToAutoScale = [];

  if (booleanToAllLayers) {
    layersToAutoScale = JSON.parse(getAllLayers('asset')) as SelectedLayer[];
  } else {
    layersToAutoScale = JSON.parse(
      getSelectedLayers('asset'),
    ) as SelectedLayer[];
  }

  if (!layersToAutoScale) return;

  for (const layer of layersToAutoScale) {
    const avLayer = app.project.layerByID(layer.id) as AVLayer;
    if (layer.asset) {
      const transform = avLayer.property('Transform') as _TransformGroup;
      transform.scale.expression = '';
    }
  }
}
