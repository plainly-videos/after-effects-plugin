const https = require('https');

import type { ClientRequest, RequestOptions, ServerResponse } from 'http';

const options = {
  hostname: `${import.meta.env.VITE_API_BASE_URL}`,
  port: 443,
  headers: {
    'Content-Type': 'application/json',
  },
};

function request(options: RequestOptions) {
  return new Promise((resolve, reject) => {
    const req: ClientRequest = https.request(options, (res: ServerResponse) => {
      let data = '';

      // Collect the response data
      res.on('data', (chunk) => {
        data += chunk;
      });

      // Resolve the Promise when the response ends
      res.on('end', () => {
        const error = JSON.parse(data).error;
        if (error) {
          reject(error); // Reject the Promise if there's an error
          return;
        }

        resolve(JSON.parse(data)); // Parse JSON if the response is JSON
      });
    });

    req.on('error', (error) => {
      reject(error); // Reject the Promise if there's an error
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
