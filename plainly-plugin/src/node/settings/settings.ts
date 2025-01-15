import fs from 'fs';
import fsPromises from 'fs/promises';

import { settingsDirectory, settingsPath } from '../constants';
import type { Settings } from '../types';

export const defaultSettings: Settings = {};

async function retrieveSettings(): Promise<Settings> {
  try {
    const file = await fsPromises.readFile(settingsPath, 'utf-8');
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
    await fsPromises.writeFile(settingsPath, settingsContent, 'utf-8');
  } catch (error) {
    console.error(`Failed to save settings: ${error}`);
  }
}

export { retrieveSettings, saveSettings };
