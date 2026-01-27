import axios, { type AxiosResponse } from 'axios';
import type FormData from 'form-data';

import { apiBaseURL, pluginBundleVersion } from '../env';
import { isPlainlyApiErrorResponse, PlainlyApiError } from './plainlyApiError';

const instance = axios.create({
  adapter: 'http',
  baseURL: `${apiBaseURL}/api/v2`,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': `plainly-plugin/${pluginBundleVersion}`,
  },
});

async function get<T>(
  path: string,
  apiKey: string,
): Promise<AxiosResponse<T, unknown>> {
  try {
    return await instance.get(path, {
      auth: {
        username: apiKey,
        password: '',
      },
    });
  } catch (error) {
    throw mapAxiosError(error);
  }
}

async function post(path: string, apiKey: string, body: string) {
  try {
    return await instance.post(path, body, {
      auth: {
        username: apiKey,
        password: '',
      },
    });
  } catch (error) {
    throw mapAxiosError(error);
  }
}

async function postFormData<T>(
  path: string,
  apiKey: string,
  body: FormData,
): Promise<AxiosResponse<T, unknown>> {
  try {
    return await instance.post(path, body, {
      headers: { ...body.getHeaders() },
      auth: {
        username: apiKey,
        password: '',
      },
    });
  } catch (error) {
    throw mapAxiosError(error);
  }
}

const mapAxiosError = (error: unknown): Error => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error : new Error(String(error));
  }

  const status = error.response?.status;
  const data = error.response?.data;
  const defaultMessage = `Request failed with status code ${status ?? 'unknown'}`;

  let message: string;
  if (typeof data === 'string' && data.trim().length > 0) {
    message = data;
  } else if (isPlainlyApiErrorResponse(data)) {
    const baseMessage = data.message ?? data.error ?? defaultMessage;
    const validationCodes = data.errors
      ?.map((entry) => entry.codes?.[0])
      .filter((code): code is string => Boolean(code));
    if (validationCodes && validationCodes.length > 0) {
      message = `${baseMessage} (${validationCodes.join(', ')})`;
    } else {
      message = baseMessage;
    }
  } else {
    message = defaultMessage;
  }

  return new PlainlyApiError({ message, status, data });
};

export { get, post, postFormData, mapAxiosError };
