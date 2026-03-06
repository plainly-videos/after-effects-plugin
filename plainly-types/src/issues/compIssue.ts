import type { ProjectIssue, ProjectIssueType } from '../validation';

interface ProjectCompIssue<T extends ProjectIssueType> extends ProjectIssue<T> {
  compId: string;
  compName: string;
}

const rendererTypes = [
  'Classic 3D',
  'Advanced 3D',
  'Cinema 4D',
  'Unknown Renderer',
] as const;
type RendererTypeName = (typeof rendererTypes)[number];

interface CompUnsupported3DRendererIssue
  extends ProjectCompIssue<ProjectIssueType.Unsupported3DRenderer> {
  renderer: RendererTypeName;
}

type CompIssues = CompUnsupported3DRendererIssue;

export type { CompUnsupported3DRendererIssue, RendererTypeName, CompIssues };
