const os = require('os');
const path = require('path');

// @ts-ignore
import CSInterface from './lib/CSInterface';

export const homeDirectory = os.homedir();
export const csInterface = new CSInterface();

export const macDest = path.join(
  homeDirectory,
  'Library',
  'Application Support',
  'Adobe',
  'Plainly Videos',
);

export const windowsDest = path.join(
  homeDirectory,
  'AppData',
  'Roaming',
  'Adobe',
  'Plainly Videos',
);

const device: string = os.platform();

export function getSettingsDirectory(): string {
  if (device === 'win32') {
    return windowsDest;
  }
  return macDest;
}
