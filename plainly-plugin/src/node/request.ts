import axios, { type AxiosResponse } from 'axios';
import type FormData from 'form-data';

import { apiBaseURL } from '../env';
import { PlainlyApiError } from './errors';

const instance = axios.create({
  adapter: 'http',
  baseURL: `${apiBaseURL}/api/v2`,
  headers: { 'Content-Type': 'application/json' },
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

const formatApiMessage = (data: unknown, status?: number) => {
  if (typeof data === 'string' && data.trim().length > 0) {
    return data;
  }

  if (data && typeof data === 'object') {
    const message =
      'message' in data && typeof data.message === 'string'
        ? data.message
        : 'error' in data && typeof data.error === 'string'
          ? data.error
          : undefined;

    if (message) return message;

    try {
      return JSON.stringify(data);
    } catch {
      // Ignore JSON serialization failures.
    }
  }

  if (status) {
    return `Request failed with status code ${status}`;
  }

  return 'Request failed';
};

const mapAxiosError = (error: unknown): Error => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error : new Error(String(error));
  }

  const status = error.response?.status;
  const data = error.response?.data;
  const message = formatApiMessage(data, status);

  return new PlainlyApiError({ message, status, data });
};

export { get, post, postFormData };
