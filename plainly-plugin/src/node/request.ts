import axios, { type AxiosResponse } from 'axios';
import type FormData from 'form-data';
import fs from 'fs';
import fsPromises from 'fs/promises';
import type { Readable } from 'stream';
import { pipeline } from 'stream/promises';

import { apiBaseURL, pluginBundleVersion } from '../env';
import {
  AcceptableClientSideApiError,
  CanceledApiError,
  ClientSideApiError,
  ErrorCode,
  GeneralCommunicationApiError,
  NoInternetConnectionApiError,
  PlainlyApiError,
  ServerSideApiError,
} from './errors';

const PLAINLY_ERROR_CODE_HEADER = 'X-PlainlyErrorCode'.toLowerCase();
const NO_INTERNET_ERROR_CODES = new Set([
  'ENOTFOUND',
  'EAI_AGAIN',
  'ENETDOWN',
  'ENETUNREACH',
  'EHOSTDOWN',
  'EHOSTUNREACH',
  'ERR_NETWORK',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'ECONNRESET',
]);

const auth = (apiKey: string) => ({ auth: { username: apiKey, password: '' } });

const instance = axios.create({
  adapter: 'http',
  baseURL: `${apiBaseURL}/api/v2`,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': `plainly-plugin/${pluginBundleVersion}`,
  },
});

const isLikelyOfflineError = (error: unknown): boolean => {
  return (
    axios.isAxiosError(error) &&
    !!error.code &&
    NO_INTERNET_ERROR_CODES.has(error.code)
  );
};

instance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toPlainlyError(error)),
);

async function get<T>(
  path: string,
  apiKey: string,
): Promise<AxiosResponse<T, unknown>> {
  return await instance.get(path, auth(apiKey));
}

async function post<T>(
  path: string,
  apiKey: string,
  body: string,
): Promise<AxiosResponse<T, unknown>> {
  return await instance.post(path, body, auth(apiKey));
}

async function postFormData<T>(
  path: string,
  apiKey: string,
  body: FormData,
  signal?: AbortSignal,
): Promise<AxiosResponse<T, unknown>> {
  return await instance.post(path, body, {
    headers: { ...body.getHeaders() },
    signal,
    ...auth(apiKey),
  });
}

async function download(
  path: string,
  apiKey: string,
  destPath: string,
): Promise<void> {
  const { data } = await instance.get<Readable>(path, {
    responseType: 'stream',
    ...auth(apiKey),
  });

  try {
    await pipeline(data, fs.createWriteStream(destPath));
  } catch (error) {
    // don't leave a partial file behind
    await fsPromises.rm(destPath, { force: true });
    throw error;
  }
}

const fallbackErrors = (error: unknown): PlainlyApiError => {
  if (isLikelyOfflineError(error)) {
    return new NoInternetConnectionApiError();
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  return new GeneralCommunicationApiError(errorMessage);
};

export const toPlainlyError = (error: unknown): PlainlyApiError => {
  if (axios.isCancel(error)) {
    return new CanceledApiError();
  }

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

export { download, get, post, postFormData };
