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

type AnyProjectIssue = TextLayerIssues;
