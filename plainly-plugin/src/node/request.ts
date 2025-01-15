const https = require('https');
const http = require('http');

import type { ClientRequest, RequestOptions, ServerResponse } from 'http';
import { hostname, isDev, port } from '../env';

const protocol = isDev ? http : https;

const options = {
  hostname: `${hostname}`,
  port: port,
  headers: { 'Content-Type': 'application/json' },
};

function request(options: RequestOptions) {
  return new Promise((resolve, reject: (reason: Error) => void) => {
    const req: ClientRequest = protocol.request(
      options,
      (res: ServerResponse) => {
        let data = '';

        // Collect the response data
        res.on('data', (chunk) => {
          data += chunk;
        });

        // Resolve or Reject the Promise when the response ends
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            const { statusCode, statusMessage } = res;
            if (statusCode >= 200 && statusCode < 400) {
              resolve(response);
            } else {
              reject({
                name: 'ResponseError',
                message: response?.message || statusMessage,
              });
            }
          } catch (error) {
            reject({
              name: 'ParseError',
              message: `Failed to parse response: ${(error as Error).message}`,
            });
          }
        });
      },
    );

    req.on('error', (error) => {
      reject({
        name: 'RequestError',
        message: error.message,
      }); // Reject the Promise if there's an error
    });

    req.end();
  });
}

async function get(path: string, apiKey: string) {
  const getOptions = {
    ...options,
    path,
    method: 'GET',
    auth: `${apiKey}:`, // Format for Basic Authentication
  };

  return request(getOptions);
}

export { get };