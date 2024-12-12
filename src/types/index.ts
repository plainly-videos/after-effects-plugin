export enum Routes {
  EXPORT = '/export',
  ABOUT = '/about',
}

export interface GlobalSettings {
  currentPage: Routes;
  sidebarOpen: boolean;
}
