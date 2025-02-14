import type { ModelBaseWithDates } from '.';

export interface Project extends ModelBaseWithDates {
  analysis: ProjectAnalysis;
  uploaded: boolean;
  name: string;
  description?: string;
  attributes?: Record<string, unknown> & {
    tags?: string[];
  };
  revisionHistory?: ProjectRevision[];
  analyzed: boolean;
}

interface ProjectAnalysis {
  done: boolean;
  pending: boolean;
  failed: boolean;
  error?: Record<string, string | object>;
  upgradeError?: Record<string, string | object>;
}

interface ProjectRevision {
  id: string;
  createdDate: string;
  expiredDate?: string;
  expired: boolean;
}
