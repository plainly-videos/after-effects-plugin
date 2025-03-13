import { useCallback, useEffect, useReducer, useState } from 'react';
import { decode, encode } from '../../node/encoding';
import {
  defaultSettings,
  retrieveSettings,
  saveSettings,
} from '../../node/settings';
import type { Settings } from '../../node/types';
import type { Pin } from '../types';
import { useUserProfile } from './api';

type Action =
  | {
      type: 'INIT_SETTINGS';
      payload: Settings;
    }
  | {
      type: 'SET_SETTINGS_API_KEY';
      payload: Settings['apiKey'];
    }
  | {
      type: 'CLEAR_SETTINGS_API_KEY';
    }
  | {
      type: 'SET_SHOW_UPDATE';
      payload: Settings['showUpdate'];
    };

function settingsReducer(settings: Settings, action: Action) {
  const reducerFunction = () => {
    switch (action.type) {
      case 'INIT_SETTINGS': {
        return action.payload;
      }
      case 'SET_SETTINGS_API_KEY': {
        return {
          ...settings,
          apiKey: action.payload,
        };
      }
      case 'CLEAR_SETTINGS_API_KEY': {
        return {
          ...settings,
          apiKey: undefined,
        };
      }
      case 'SET_SHOW_UPDATE': {
        return {
          ...settings,
          showUpdate: action.payload,
        };
      }
      default:
        return settings;
    }
  };

  if (action.type !== 'INIT_SETTINGS') {
    saveSettings(reducerFunction());
  }

  return reducerFunction();
}

export const useSettings = () => {
  const [settings, dispatch] = useReducer(settingsReducer, defaultSettings);
  const [loading, setLoading] = useState(true);
  const { mutateAsync: getUserProfile } = useUserProfile();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const initialSettings = await retrieveSettings();
        dispatch({ type: 'INIT_SETTINGS', payload: initialSettings });
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const setSettingsApiKey = useCallback(
    async (apiKey: string, pin: Pin | undefined) => {
      try {
        await getUserProfile(apiKey);
      } catch (error) {
        throw new Error(
          'Invalid API key, please make sure to copy a valid API key from Plainly web-app and try again.',
        );
      }

      let newApiKey = apiKey;
      if (pin) {
        const secret = pin.getPin();
        newApiKey = encode(secret, apiKey);
      }

      dispatch({
        type: 'SET_SETTINGS_API_KEY',
        payload: { key: newApiKey, encrypted: !!pin },
      });
    },
    [getUserProfile],
  );

  const getSettingsApiKey = useCallback(
    (pin: string | undefined = undefined): string => {
      const { key, encrypted } = settings.apiKey ?? {};

      if (!key) {
        throw new Error('API key is not set.');
      }

      if (pin && !encrypted) {
        throw new Error('API key is not encrypted, pin is not required.');
      }

      if (!pin && encrypted) {
        throw new Error('API key is encrypted, pin is required.');
      }

      if (pin && encrypted) {
        try {
          const decoded = decode(pin, key);
          return decoded;
        } catch (error) {
          throw new Error('Invalid PIN entered.');
        }
      } else {
        return key;
      }
    },
    [settings.apiKey],
  );

  const clearApiKey = useCallback(async () => {
    dispatch({
      type: 'CLEAR_SETTINGS_API_KEY',
    });
  }, []);

  const setShowUpdate = useCallback((showUpdate: boolean) => {
    dispatch({ type: 'SET_SHOW_UPDATE', payload: showUpdate });
  }, []);

  return {
    apiKeySet: !!settings.apiKey,
    apiKeyEncrypted: settings.apiKey?.encrypted,
    loading,
    getSettingsApiKey,
    setSettingsApiKey,
    clearApiKey,
    showUpdate: !!settings.showUpdate,
    setShowUpdate,
  };
};
