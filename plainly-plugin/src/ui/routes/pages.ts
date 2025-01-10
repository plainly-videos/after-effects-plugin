import { FolderOutput, InfoIcon } from 'lucide-react';
import { Routes } from '../types';

export const pages = [
  {
    name: 'Export',
    to: Routes.EXPORT,
    icon: FolderOutput,
  },
];

export const resources = [
  {
    name: 'About',
    to: Routes.ABOUT,
    icon: InfoIcon,
  },
];
