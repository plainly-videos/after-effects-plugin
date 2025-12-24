export enum ProjectIssueType {
  AllCaps = 'AllCaps',
  Dimensions = 'Dimensions',
}

interface ProjectIssue<T extends ProjectIssueType> {
  type: T;
}

interface ProjectLayerIssue<T extends ProjectIssueType>
  extends ProjectIssue<T> {
  layerId: string;
  layerName: string;
}

interface ProjectCompIssue<T extends ProjectIssueType> extends ProjectIssue<T> {
  compId: string;
  compName: string;
}

// Text layer related issues
interface TextAllCapsEnabledIssue
  extends ProjectLayerIssue<ProjectIssueType.AllCaps> {}

// Comp related issues
interface CompDimensionsIssue
  extends ProjectCompIssue<ProjectIssueType.Dimensions> {}

type TextLayerIssues = TextAllCapsEnabledIssue & { text: true };
type CompIssues = CompDimensionsIssue & { comp: true };

type AnyProjectIssue = TextLayerIssues | CompIssues;

export type {
  TextAllCapsEnabledIssue,
  TextLayerIssues,
  CompDimensionsIssue,
  CompIssues,
  AnyProjectIssue,
};
