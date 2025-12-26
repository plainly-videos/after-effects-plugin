enum ProjectIssueType {
  AllCaps = 'AllCaps',
  Unsupported3DRenderer = 'Unsupported3DRenderer',
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

type TextLayerIssues = TextAllCapsEnabledIssue & { text: true };
type CompIssues = CompUnsupported3DRendererIssue & { comp: true };

type AnyProjectIssue = TextLayerIssues | CompIssues;

export type {
  ProjectIssue,
  ProjectLayerIssue,
  ProjectCompIssue,
  TextAllCapsEnabledIssue,
  TextLayerIssues,
  CompUnsupported3DRendererIssue,
  RendererTypeName,
  CompIssues,
  AnyProjectIssue,
};

export { ProjectIssueType };
