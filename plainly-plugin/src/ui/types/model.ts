export interface ModelBase {
  id: string;
}

export interface ModelBaseWithDates extends ModelBase {
  createdDate: string;
  lastModified: string;
}

export interface Project extends ModelBaseWithDates {
  name: string;
  revisionHistory?: ProjectRevision[];
}

interface ProjectRevision {
  id: string;
  createdDate: string;
}
