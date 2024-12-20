export enum Routes {
  EXPORT = '/export',
  SETTINGS = '/settings',
  ABOUT = '/about',
}

export interface GlobalSettings {
  currentPage: Routes;
  sidebarOpen: boolean;
}

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface Notification {
  title: string;
  type: NotificationType;
  description?: string;
}

export interface Pin {
  first: number | undefined;
  second: number | undefined;
  third: number | undefined;
  fourth: number | undefined;
}
