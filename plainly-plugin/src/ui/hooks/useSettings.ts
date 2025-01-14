import { useCallback, useEffect, useReducer, useState } from 'react';
import { encode } from '../../node/encoding';
import { get } from '../../node/request';
import {
  defaultSettings,
  retrieveSettings,
  saveSettings,
} from '../../node/settings';
import type { Settings } from '../../node/types';
import type { Pin } from '../types';

type Action =
  | {
      type: 'INIT_SETTINGS';
      payload: Settings;
    }
  | {
      type: 'SET_SETTINGS_API_KEY';
      payload: Settings['apiKey'];
    };

function settingsReducer(settings: Settings, action: Action) {
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
    default:
      return settings;
  }
}

export const useSettings = () => {
  const [settings, dispatch] = useReducer(settingsReducer, defaultSettings);
  const [loading, setLoading] = useState(true);

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
        await get('/api/v2/integrations/appmixer/user-profile', apiKey);
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

      const newSettings = {
        ...settings,
        apiKey: {
          key: newApiKey,
          encrypted: !!pin,
        },
      };

      try {
        await saveSettings(newSettings);
        dispatch({
          type: 'SET_SETTINGS_API_KEY',
          payload: { key: newApiKey, encrypted: !!pin },
        });
      } catch (error) {
        throw new Error(`Failed to set API key: ${(error as Error).message}`);
      }
    },
    [settings],
  );

  return { settings, setSettingsApiKey, loading };
};
