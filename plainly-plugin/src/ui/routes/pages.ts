import {
  FolderOutput,
  FoldersIcon,
  InfoIcon,
  type LucideIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UploadIcon,
} from 'lucide-react';
import { Routes } from '../types';

export interface Page {
  type: 'page';
  name: string;
  to: Routes;
  icon: LucideIcon;
}

export interface Separator {
  type: 'separator';
  name: string;
}

export const pages: (Page | Separator)[] = [
  {
    type: 'page',
    name: 'Export',
    to: Routes.EXPORT,
    icon: FolderOutput,
  },
  {
    type: 'page',
    name: 'Upload',
    to: Routes.UPLOAD,
    icon: UploadIcon,
  },
  {
    type: 'page',
    name: 'Projects',
    to: Routes.PROJECTS,
    icon: FoldersIcon,
  },
  {
    type: 'page',
    name: 'Validate',
    to: Routes.VALIDATE,
    icon: ShieldCheckIcon,
  },
  {
    type: 'separator',
    name: 'separator-1',
  },
  {
    type: 'page',
    name: 'Settings',
    to: Routes.SETTINGS,
    icon: SettingsIcon,
  },
];

export const resources: (Page | Separator)[] = [
  {
    type: 'page',
    name: 'About',
    to: Routes.ABOUT,
    icon: InfoIcon,
  },
];
