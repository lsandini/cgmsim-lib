const { createHash } = require('crypto');
import * as https from 'https';

export default function (apiSecret: string, isHttps?: boolean): { getParams: any, postParams: any } {
  const agent: https.Agent | null = isHttps ? new https.Agent({ rejectUnauthorized: false }) : null;
  const hash = createHash('sha1');
  hash.update(apiSecret);

  const hash_secret = hash.digest('hex');

  const headers = {
      'Content-Type': 'application/json',
      'api-secret': hash_secret,
  };

  return {
      getParams: {
          method: 'GET',
          headers,
          agent,
      },
      postParams: {
          method: 'POST',
          headers,
          agent,
      },
  };
}