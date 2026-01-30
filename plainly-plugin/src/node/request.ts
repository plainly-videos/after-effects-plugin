import axios, { type AxiosResponse } from 'axios';
import type FormData from 'form-data';

import { apiBaseURL, pluginBundleVersion } from '../env';
import {
  AcceptableClientSideApiError,
  ClientSideApiError,
  ErrorCode,
  GeneralCommunicationApiError,
  NoInternetConnectionApiError,
  PlainlyApiError,
  ServerSideApiError,
} from './errors';

const PLAINLY_ERROR_CODE_HEADER = 'X-PlainlyErrorCode'.toLowerCase();

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
    throw toPlainlyError(error);
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
    throw toPlainlyError(error);
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
    throw toPlainlyError(error);
  }
}

const fallbackErrors = (error: unknown): PlainlyApiError => {
  // check for offline first
  if (!navigator.onLine) {
    return new NoInternetConnectionApiError();
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  return new GeneralCommunicationApiError(errorMessage);
};

export const toPlainlyError = (error: unknown): PlainlyApiError => {
  if (!axios.isAxiosError(error)) {
    return fallbackErrors(error);
  }

  const response = error.response;
  if (!response) return fallbackErrors(error);

  const code = response.headers[PLAINLY_ERROR_CODE_HEADER];
  const errorCode = Object.values(ErrorCode).find((c) => c === code);
  const data = response.data;
  const { message, errors } = data || {};

  if (errorCode) {
    return new PlainlyApiError(errorCode, undefined, message, errors);
  } else {
    const { status } = response;
    if (status >= 500) {
      return new ServerSideApiError(status, message, errors);
    }

    if (status >= 400) {
      const acceptableStatusCodes: Record<number, ErrorCode> = {
        401: ErrorCode.GENERAL_UNAUTHORIZED,
        403: ErrorCode.GENERAL_FORBIDDEN,
        429: ErrorCode.GENERAL_TOO_MANY_REQUESTS,
      };

      const acceptableErrorCode = acceptableStatusCodes[status];
      if (acceptableErrorCode) {
        return new AcceptableClientSideApiError(acceptableErrorCode, status);
      }
      return new ClientSideApiError(status, message, errors);
    }

    return new GeneralCommunicationApiError(message, errors);
  }
};

export { get, post, postFormData };
