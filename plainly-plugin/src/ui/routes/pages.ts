import {
  FolderOutput,
  FoldersIcon,
  InfoIcon,
  SettingsIcon,
  UploadIcon,
} from 'lucide-react';
import { Routes } from '../types';

export const pages = [
  {
    name: 'Export',
    to: Routes.EXPORT,
    icon: FolderOutput,
  },
  {
    name: 'Upload',
    to: Routes.UPLOAD,
    icon: UploadIcon,
  },
  {
    name: 'Projects',
    to: Routes.PROJECTS,
    icon: FoldersIcon,
  },
  {
    name: 'Settings',
    to: Routes.SETTINGS,
    icon: SettingsIcon,
  },
];

export const resources = [
  {
    name: 'About',
    to: Routes.ABOUT,
    icon: InfoIcon,
  },
];
