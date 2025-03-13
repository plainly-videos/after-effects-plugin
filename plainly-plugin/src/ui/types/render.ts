import type { ModelBaseWithDates } from '.';

// extend when more is needed
export interface Render extends ModelBaseWithDates {
  projectId: string;
  templateId: string;
  createdBy?: string;
  submittedDate: string;
  expirationDate?: string;
  state: RenderState;
  retried?: boolean;
  expired?: boolean;
  projectName: string;
  templateName: string;
  compositionName: string;
  output?: string;
  outputWatermark?: string;
  projectZipUrl?: string;
  attributes?: Record<string, unknown>;
  thumbnailUris?: string[];
  error: { [key: string]: string | object };
  publicDesign?: boolean;
}

export enum RenderState {
  PENDING = 'PENDING',
  THROTTLED = 'THROTTLED',
  QUEUED = 'QUEUED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  FAILED = 'FAILED',
  INVALID = 'INVALID',
  CANCELLED = 'CANCELLED',
}
