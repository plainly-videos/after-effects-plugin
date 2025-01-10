const os = require('os');
const path = require('path');

// @ts-ignore
import CSInterface from './lib/CSInterface';

// csInterface related
export const csInterface = new CSInterface();

// directory related
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
function getSettingsDirectory(): string {
  if (device === 'win32') {
    return windowsDest;
  }
  return macDest;
}

export const settingsDirectory = getSettingsDirectory();
