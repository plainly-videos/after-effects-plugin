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
  return new Promise((resolve, reject) => {
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
            const { statusCode } = res;
            if (statusCode >= 200 && statusCode < 400) {
              resolve(response);
            } else {
              reject({
                statusCode,
                message: data,
              });
            }
          } catch (error) {
            reject(`Failed to parse response: ${(error as Error).message}`);
          }
        });
      },
    );

    req.on('error', (error) => {
      reject({
        statusCode: 500,
        message: error.message,
        error,
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
