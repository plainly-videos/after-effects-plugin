import axios, { type AxiosResponse } from 'axios';
import type FormData from 'form-data';

import { apiBaseURL, pluginBundleVersion } from '../env';
import {
  PlainlyApiError,
  type PlainlyApiErrorResponse,
} from './plainlyApiError';

const auth = (apiKey: string) => ({ auth: { username: apiKey, password: '' } });

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
    return await instance.get(path, auth(apiKey));
  } catch (error) {
    throw mapAxiosError(error);
  }
}

async function post<T>(
  path: string,
  apiKey: string,
  body: string,
): Promise<AxiosResponse<T, unknown>> {
  try {
    return await instance.post(path, body, auth(apiKey));
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
      ...auth(apiKey),
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

  // no response data, return default error
  if (!data) {
    return new PlainlyApiError({ message: defaultMessage, status, data });
  }

  const statusPrefix = status ? `${status}: ` : '';
  let message = `${statusPrefix}`;
  try {
    // string response data, use as message
    if (typeof data === 'string') {
      message += data;
      return new PlainlyApiError({ message, status, data });
    }

    // assume structure, fallback to defaultMessage on failure
    const plainlyData = data as PlainlyApiErrorResponse;
    const baseMessage = plainlyData.message ?? plainlyData.error;

    // no message in response data, return default error
    if (!baseMessage) {
      return new PlainlyApiError({ message: defaultMessage, status, data });
    }

    const validationCodes = plainlyData.errors
      ?.map((entry) => entry.codes?.[0])
      .filter((code): code is string => Boolean(code));

    // construct message with validation codes if present
    if (validationCodes?.length) {
      message += `${baseMessage} (${validationCodes.join(', ')})`;
    } else {
      message += baseMessage;
    }
  } catch {
    // in case of any error, return default message
    message = defaultMessage;
  }

  return new PlainlyApiError({ message, status, data });
};

export { get, post, postFormData, mapAxiosError };
