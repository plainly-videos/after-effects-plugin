import { FolderOutput, InfoIcon, SettingsIcon } from 'lucide-react';
import { Routes } from '../types';

export const pages = [
  {
    name: 'Export',
    to: Routes.EXPORT,
    icon: FolderOutput,
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
