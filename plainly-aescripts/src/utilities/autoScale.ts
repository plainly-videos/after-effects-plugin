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

function getSelectedLayers(type: 'text' | 'asset') {
  const selectedLayers: SelectedLayer[] = [];

  for (let i = 1; i <= app.project.numItems; i++) {
    const item = app.project.item(i);
    if (item instanceof CompItem) {
      for (let j = 0; j < item.selectedLayers.length; j++) {
        if (type === 'text' && item.selectedLayers[j] instanceof TextLayer) {
          const layer = item.selectedLayers[j] as TextLayer;

          if (layer.selected && layer.sourceText) {
            const textType = layer.sourceText.value.pointText ? 'point' : 'box';

            selectedLayers.push({
              id: layer.id,
              name: layer.name,
              text: true,
              textType,
            });
          }
        }

        if (type === 'asset' && item.selectedLayers[j] instanceof AVLayer) {
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
        if (type === 'text' && item.layer(j + 1) instanceof TextLayer) {
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

        if (type === 'asset' && item.layer(j + 1) instanceof AVLayer) {
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
          }
        }
      }
    }
  }

  return JSON.stringify(layers);
}

function applyTextAutoScale(toAllLayers: string, width: string) {
  const booleanToAllLayers = toAllLayers === 'true';
  let layersToAutoScale = [];

  if (booleanToAllLayers) {
    layersToAutoScale = JSON.parse(getAllLayers('text')) as SelectedLayer[];
  } else {
    layersToAutoScale = JSON.parse(
      getSelectedLayers('text'),
    ) as SelectedLayer[];
  }

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
var textWidth = sourceRectAtTime(0, false).width;
var scaleLimit = (${widthToUse}/textWidth) * 100;
var fixedScale = scaleLimit > 100 ? 100 : scaleLimit;
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
      const height = avLayer.sourceRectAtTime(avLayer.startTime, false).height;
      const width = avLayer.sourceRectAtTime(avLayer.startTime, false).width;
      const scale = avLayer.scale.value;

      const [frameWidth, frameHeight] = [
        (width * scale[0]) / 100,
        (height * scale[1]) / 100,
      ];

      const transform = avLayer.property('Transform') as _TransformGroup;
      const autoScaleAsset = `
var newWidth = sourceRectAtTime(0, false).width;
var newHeight = sourceRectAtTime(0, false).height;
var widthRatio = ${frameWidth} / newWidth;
var heightRatio = ${frameHeight} / newHeight;

var fixedScale;

if (widthRatio > heightRatio) {
  fixedScale = heightRatio * 100;
} else {
  fixedScale = widthRatio * 100;
}

[fixedScale, fixedScale]
      `;

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
