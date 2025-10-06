enum ProjectIssueType {
  AllCaps = 'AllCaps',
}

interface ProjectIssue<T extends ProjectIssueType> {
  type: T;
}

interface ProjectLayerIssue<T extends ProjectIssueType>
  extends ProjectIssue<T> {
  layerId: string;
  layerName: string;
}

interface TextAllCapsEnabledIssue
  extends ProjectLayerIssue<ProjectIssueType.AllCaps> {}

type TextLayerIssues = TextAllCapsEnabledIssue & {
  text: true;
};

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
          layerName: `${comp.name} > ${layer.name}`,
          text: true,
        });
      }
    }
  }

  return textLayers;
}

type AnyProjectIssue = TextLayerIssues;

function validateProject(): string {
  const textIssues: TextLayerIssues[] | undefined = checkTextLayers();
  let issues: AnyProjectIssue[] = [];

  if (textIssues && textIssues.length > 0) {
    issues = issues.concat(textIssues);
  }

  if (issues.length > 0) {
    return JSON.stringify(issues);
  }

  return 'undefined';
}

function selectLayer(layerId: string) {
  const layer = app.project.layerByID(parseInt(layerId, 10));
  if (layer) {
    layer.selected = true;
  }
}
