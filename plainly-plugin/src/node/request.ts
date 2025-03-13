import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type FormData from 'form-data';

import { apiBaseURL } from '../env';

const instance = axios.create({
  adapter: 'http',
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function get<T>(
  path: string,
  apiKey: string,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T, unknown>> {
  return instance.get(path, {
    auth: {
      username: apiKey,
      password: '',
    },
    ...config,
  });
}

async function post<T>(
  path: string,
  apiKey: string,
  body: T,
  config?: AxiosRequestConfig,
) {
  return instance.post(path, body, {
    auth: {
      username: apiKey,
      password: '',
    },
    ...config,
  });
}

async function postFormData<T>(
  path: string,
  apiKey: string,
  body: FormData,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T, unknown>> {
  return instance.post(path, body, {
    headers: { ...body.getHeaders() },
    auth: {
      username: apiKey,
      password: '',
    },
    ...config,
  });
}

export { get, post, postFormData };
