const fsPromises = require('fs/promises');
const fs = require('fs');
const path = require('path');

import { getSettingsDirectory } from '../constants';
import type { Settings } from '../types';

const settingsDirectory = getSettingsDirectory();
export const defaultSettings: Settings = {};

async function retrieveSettings() {
  try {
    const file = await fsPromises.readFile(
      path.join(settingsDirectory, 'settings.json'),
      'utf-8',
    );
    return JSON.parse(file);
  } catch (error) {
    console.error(`Failed to read settings: ${error}`);
    return defaultSettings;
  }
}

async function saveSettings(settings: Settings) {
  if (!fs.existsSync(settingsDirectory)) {
    fs.mkdirSync(settingsDirectory, { recursive: true });
  }

  try {
    const settingsContent = JSON.stringify(settings, null, 2);
    await fsPromises.writeFile(
      path.join(settingsDirectory, 'settings.json'),
      settingsContent,
      'utf-8',
    );
  } catch (error) {
    console.error(`Failed to save settings: ${error}`);
  }
}

export { retrieveSettings, saveSettings };
