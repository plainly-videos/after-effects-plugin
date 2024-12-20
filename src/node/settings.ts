const fsPromises = require('fs/promises');
const fs = require('fs');
const path = require('path');

import type { Pin } from '../types';
import { getSettingsDirectory } from './constants';
import { encode } from './encoding';
import { get } from './request';
import type { Settings } from './types';

async function getSettings(): Promise<Settings> {
  const settingsFile = await retrieveSettings();

  const settingsIni: Settings = JSON.parse(settingsFile);
  return settingsIni;
}

async function setSettingsApiKey(apiKey: string, pin: Pin | undefined) {
  try {
    await get('/api/v2/integrations/appmixer/user-profile', apiKey);
  } catch (error) {
    throw new Error(
      'Invalid API key, please make sure to copy a valid API key from Plainly web-app and try again.',
    );
  }

  const settings = await getSettings();
  const newSettings = { ...settings, apiKey, hasPin: false };

  if (pin) {
    const secret = `${pin.first}${pin.second}${pin.third}${pin.fourth}`;

    newSettings.apiKey = encode(secret, apiKey);
    newSettings.hasPin = true;
  }

  await saveSettings(newSettings);
}

export { getSettings, setSettingsApiKey };

async function retrieveSettings() {
  const dest = getSettingsDirectory();

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  if (!fs.existsSync(path.join(dest, 'settings.ini'))) {
    fs.writeFileSync(path.join(dest, 'settings.ini'), '{}');
  }

  const settingsFile = await fsPromises.readFile(
    path.join(dest, 'settings.ini'),
    'utf-8',
  );
  if (!settingsFile) {
    throw new Error('Settings file not found');
  }

  return await fsPromises.readFile(path.join(dest, 'settings.ini'), 'utf-8');
}

async function saveSettings(settings: Settings) {
  const settingsFile = JSON.stringify(settings, null, 2);
  const dest = getSettingsDirectory();

  await fsPromises.writeFile(
    path.join(dest, 'settings.ini'),
    settingsFile,
    'utf-8',
  );
}
