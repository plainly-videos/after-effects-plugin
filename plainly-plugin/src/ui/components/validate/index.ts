export * from './ConfirmationModal';
export * from './comp';
export * from './file';
export * from './Issue';
export * from './text';
export * from './Validations';

enum ProjectIssueType {
  AllCaps = 'AllCaps',
  Unsupported3DRenderer = 'Unsupported3DRenderer',
  FileUnsupported = 'FileUnsupported',
}

const itAllCaps = ProjectIssueType.AllCaps;
const itUns3DRenderer = ProjectIssueType.Unsupported3DRenderer;
const itFileUns = ProjectIssueType.FileUnsupported;

export { ProjectIssueType, itAllCaps, itUns3DRenderer, itFileUns };
