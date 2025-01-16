import axios from 'axios';
import type FormData from 'form-data';

import { baseURL } from '../env';

const instance = axios.create({
  adapter: 'http',
  baseURL: baseURL,
});

async function get(path: string, apiKey: string) {
  return instance.get(path, {
    headers: {
      'Content-Type': 'application/json',
    },
    auth: {
      username: apiKey,
      password: '',
    },
  });
}

async function post(path: string, apiKey: string, body: string) {
  return instance.post(path, body, {
    headers: {
      'Content-Type': 'application/json',
    },
    auth: {
      username: apiKey,
      password: '',
    },
  });
}

async function postFormData(path: string, apiKey: string, body: FormData) {
  return instance.post(path, body, {
    headers: { ...body.getHeaders() },
    auth: {
      username: apiKey,
      password: '',
    },
  });
}

export { get, post, postFormData };
