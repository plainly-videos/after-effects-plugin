import type { ProjectIssue, ProjectIssueType } from '../validation';

interface ProjectLayerIssue<T extends ProjectIssueType>
  extends ProjectIssue<T> {
  layerId: string;
  layerName: string;
}

// Text layer related issues
interface TextAllCapsEnabledIssue
  extends ProjectLayerIssue<ProjectIssueType.AllCaps> {}

type TextLayerIssues = TextAllCapsEnabledIssue & { text: true };

export type { TextAllCapsEnabledIssue, TextLayerIssues };
