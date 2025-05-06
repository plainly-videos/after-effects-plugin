function getSelectedLayersAnchor() {
  const selectedLayers = [];

  for (let i = 1; i <= app.project.numItems; i++) {
    const item = app.project.item(i);
    if (item instanceof CompItem) {
      for (let j = 0; j < item.selectedLayers.length; j++) {
        const layer = item.selectedLayers[j];

        if (layer.selected) {
          selectedLayers.push({
            id: layer.id,
            name: layer.name,
          });
        }
      }
    }
  }

  return JSON.stringify(selectedLayers);
}

function changeAnchorPoint(location: string) {
  const selectedLayers = JSON.parse(getSelectedLayersAnchor());

  for (const layer of selectedLayers) {
    const aeLayer = app.project.layerByID(layer.id);

    if (aeLayer) {
      const transform = aeLayer.property('Transform') as _TransformGroup;

      switch (location) {
        case 'topLeft': {
          transform.anchorPoint.expression = `
var r = sourceRectAtTime();
[r.left, r.top];
    `.trim();
          break;
        }

        case 'topCenter': {
          transform.anchorPoint.expression = `
var r = sourceRectAtTime();
[r.left + r.width / 2, r.top];
    `.trim();
          break;
        }

        case 'topRight': {
          transform.anchorPoint.expression = `
var r = sourceRectAtTime();
[r.left + r.width, r.top];
    `.trim();
          break;
        }

        case 'centerLeft': {
          transform.anchorPoint.expression = `
var r = sourceRectAtTime();
[r.left, r.top + r.height / 2];
    `.trim();
          break;
        }

        case 'center': {
          transform.anchorPoint.expression = `
var r = sourceRectAtTime();
[r.left + r.width / 2, r.top + r.height / 2];
    `.trim();
          break;
        }

        case 'centerRight': {
          transform.anchorPoint.expression = `
var r = sourceRectAtTime();
[r.left + r.width, r.top + r.height / 2];
    `.trim();
          break;
        }

        case 'bottomLeft': {
          transform.anchorPoint.expression = `
var r = sourceRectAtTime();
[r.left, r.top + r.height];
    `.trim();
          break;
        }

        case 'bottomCenter': {
          transform.anchorPoint.expression = `
var r = sourceRectAtTime();
[r.left + r.width / 2, r.top + r.height];
    `.trim();
          break;
        }

        case 'bottomRight': {
          transform.anchorPoint.expression = `
var r = sourceRectAtTime();
[r.left + r.width, r.top + r.height];
    `.trim();
          break;
        }
      }
    }
  }
}

function removeAnchorPoint() {
  const selectedLayers = JSON.parse(getSelectedLayersAnchor());

  for (const layer of selectedLayers) {
    const aeLayer = app.project.layerByID(layer.id);

    if (aeLayer) {
      const transform = aeLayer.property('Transform') as _TransformGroup;
      transform.anchorPoint.expression = '';
    }
  }
}
