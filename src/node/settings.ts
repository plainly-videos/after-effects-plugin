const os = require('os');
const fsPromises = require('fs/promises');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

import type { Pin } from '../types';
import { macDest, windowsDest } from './constants';
import { get } from './request';
import type { Settings } from './types';

const device = os.type();

async function getSettings(): Promise<Settings> {
  let settingsFile: string;

  if (device === 'Windows_NT') {
    settingsFile = await retrieveSettingsFile(windowsDest);
    const settingsIni: Settings = JSON.parse(settingsFile);
    return settingsIni;
  }

  settingsFile = await retrieveSettingsFile(macDest);
  const settingsIni: Settings = JSON.parse(settingsFile);
  return settingsIni;
}

async function setSettingsApiKey(apiKey: string, pin: Pin | undefined) {
  try {
    await get('/api/v2/integrations/appmixer/user-profile', apiKey);
  } catch (error) {
    throw new Error('Invalid API key');
  }

  const settings = await getSettings();
  const newSettings = { ...settings, apiKey, hasPin: false };

  if (pin) {
    const secret = `${pin.first}${pin.second}${pin.third}${pin.fourth}`;
    const key = crypto.createHash('sha256').update(secret).digest(); // 32-byte key for AES-256

    // Encrypt the API key without IV (AES-ECB)
    const cipher = crypto.createCipheriv('aes-256-ecb', key, null); // No IV for ECB mode
    let newApiKey = cipher.update(apiKey, 'utf8', 'hex');
    newApiKey += cipher.final('hex');

    newSettings.apiKey = newApiKey;
    newSettings.hasPin = true;
  }

  await saveSettings(newSettings);
}

export { getSettings, setSettingsApiKey };

async function retrieveSettingsFile(dest: string) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  if (!fs.existsSync(path.join(dest, 'settings.ini'))) {
    fs.writeFileSync(path.join(dest, 'settings.ini'), '{}');
  }

  return await fsPromises.readFile(path.join(dest, 'settings.ini'), 'utf-8');
}

async function saveSettings(settings: Settings) {
  const settingsFile = JSON.stringify(settings, null, 2);

  if (device === 'Windows_NT') {
    await fsPromises.writeFile(
      path.join(windowsDest, 'settings.ini'),
      settingsFile,
      'utf-8',
    );
  }

  await fsPromises.writeFile(
    path.join(macDest, 'settings.ini'),
    settingsFile,
    'utf-8',
  );
}
