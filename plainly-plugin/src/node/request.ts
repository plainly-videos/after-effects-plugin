import http from 'http';
import https from 'https';

import type { ClientRequest, IncomingMessage, RequestOptions } from 'http';
import type FormData from 'form-data';
import { hostname, isDev, port } from '../env';

const protocol = isDev ? http : https;

const applicationJson = { 'Content-Type': 'application/json' };
const options: RequestOptions = {
  hostname: `${hostname}`,
  port: port,
};

function request(options: RequestOptions, body?: FormData | string) {
  return new Promise((resolve, reject: (reason: Error) => void) => {
    const req: ClientRequest = protocol.request(
      options,
      (res: IncomingMessage) => {
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

    if (body) {
      if (typeof body === 'string') {
        // for application/json
        req.write(body, (err) => {
          if (err) {
            reject({
              name: 'WriteError',
              message: err.message,
            });
          }

          req.end(); // needs to be here because of the write and async
        });
      } else {
        // for multipart/form-data
        body.pipe(req, { end: true });
      }
    } else {
      // in case of a GET request we need to end
      req.end();
    }
  });
}

async function get(path: string, apiKey: string) {
  const getOptions: RequestOptions = {
    ...options,
    headers: applicationJson,
    path,
    method: 'GET',
    auth: `${apiKey}:`, // Format for Basic Authentication
  };

  return request(getOptions);
}

async function post(path: string, apiKey: string, body: FormData | string) {
  const headers =
    typeof body === 'string' ? { applicationJson } : body.getHeaders();

  const postOptions: RequestOptions = {
    ...options,
    headers,
    path,
    method: 'POST',
    auth: `${apiKey}:`, // Format for Basic Authentication
  };

  return request(postOptions, body);
}

export { get, post };
