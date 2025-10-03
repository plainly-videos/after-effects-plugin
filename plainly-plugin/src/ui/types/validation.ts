export enum ProjectIssueType {
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

export type TextLayerIssues = TextAllCapsEnabledIssue & {
  text: true;
};

export type AnyProjectIssue = TextLayerIssues;
