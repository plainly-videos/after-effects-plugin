export enum Routes {
  EXPORT = '/export',
  UPLOAD = '/upload',
  PROJECTS = '/projects',
  VALIDATE = '/validate',
  SETTINGS = '/settings',
  ABOUT = '/about',
}

export interface GlobalSettings {
  currentPage: Routes;
  sidebarOpen: boolean;
  documentId: string;
}

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
}

export interface Notification {
  id: string;
  title: string;
  type: NotificationType;
  description?: string;
}

export class Pin {
  first: number | undefined;
  second: number | undefined;
  third: number | undefined;
  fourth: number | undefined;

  constructor(
    first?: number,
    second?: number,
    third?: number,
    fourth?: number,
  ) {
    this.first = first;
    this.second = second;
    this.third = third;
    this.fourth = fourth;
  }

  getPin() {
    return `${this.first}${this.second}${this.third}${this.fourth}`;
  }

  isFilled() {
    return (
      this.first !== undefined &&
      this.second !== undefined &&
      this.third !== undefined &&
      this.fourth !== undefined
    );
  }
}

export interface ModelBase {
  id: string;
}

export interface ModelBaseWithDates extends ModelBase {
  createdDate: string;
  lastModified: string;
}
