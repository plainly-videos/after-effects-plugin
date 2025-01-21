import axios, { type AxiosResponse } from 'axios';
import type FormData from 'form-data';

import { baseURL } from '../env';

const instance = axios.create({
  adapter: 'http',
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function get(path: string, apiKey: string) {
  return instance.get(path, {
    auth: {
      username: apiKey,
      password: '',
    },
  });
}

async function post(path: string, apiKey: string, body: string) {
  return instance.post(path, body, {
    auth: {
      username: apiKey,
      password: '',
    },
  });
}

async function postFormData<T>(
  path: string,
  apiKey: string,
  body: FormData,
): Promise<AxiosResponse<T, unknown>> {
  return instance.post(path, body, {
    headers: { ...body.getHeaders() },
    auth: {
      username: apiKey,
      password: '',
    },
  });
}

export { get, post, postFormData };
