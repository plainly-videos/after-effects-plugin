import os from 'os';
import path from 'path';

// @ts-ignore
import CSInterface from './lib/CSInterface';

// csInterface related
export const csInterface = new CSInterface();

// directory related
const settingsFileName = 'settings.json';
const homeDirectory = os.homedir();
const macDest = path.join(
  homeDirectory,
  'Library',
  'Application Support',
  'Adobe',
  'Plainly Videos',
);
const windowsDest = path.join(
  homeDirectory,
  'AppData',
  'Roaming',
  'Adobe',
  'Plainly Videos',
);
const device: string = os.platform();
export const settingsDirectory = device === 'win32' ? windowsDest : macDest;
export const settingsPath = path.join(settingsDirectory, settingsFileName);
