const fsPromises = require('fs/promises');
const fs = require('fs');
const path = require('path');

import { defaultSettings, getSettingsDirectory } from './constants';
import type { Settings } from './types';

async function setSettings(settings: Settings) {
  let newSettings: Settings = settings;
  if (settings.apiKey) {
    newSettings = {
      ...settings,
      apiKey: {
        key: settings.apiKey.key,
        encrypted: settings.apiKey.encrypted,
      },
    };
  }

  try {
    await saveSettings(newSettings);
  } catch (error) {
    console.log(error);
  }
}

async function retrieveSettings() {
  const dest = getSettingsDirectory();

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  if (!fs.existsSync(path.join(dest, 'settings.json'))) {
    fs.writeFileSync(
      path.join(dest, 'settings.json'),
      JSON.stringify(defaultSettings),
    );
  }

  try {
    const file = await fsPromises.readFile(
      path.join(dest, 'settings.json'),
      'utf-8',
    );
    const json = JSON.parse(file);
    return json;
  } catch (error) {
    return defaultSettings;
  }
}

export { retrieveSettings, setSettings };

async function saveSettings(settings: Settings) {
  const settingsContent = JSON.stringify(settings, null, 2);
  const dest = getSettingsDirectory();

  await fsPromises.writeFile(
    path.join(dest, 'settings.json'),
    settingsContent,
    'utf-8',
  );
}
