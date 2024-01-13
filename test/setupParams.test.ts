import createApiParams from '../src/setupParams';
const https = require('https');

describe('createApiParams', () => {
  test('returns correct parameters for GET request with HTTPS', () => {
    const apiSecret = 'yourApiSecret';
    const isHttps = true;

    const result = createApiParams(apiSecret, isHttps);

    // Check GET parameters with HTTPS
    expect(result.getParams.method).toBe('GET');
    expect(result.getParams.headers['Content-Type']).toBe('application/json');
    expect(result.getParams.headers['api-secret']).toBeDefined();
    expect(result.getParams.agent instanceof https.Agent).toBe(true);
  });

  test('returns correct parameters for GET request without HTTPS', () => {
    const apiSecret = 'yourApiSecret';
    const isHttps = false;

    const result = createApiParams(apiSecret, isHttps);

    // Check GET parameters without HTTPS
    expect(result.getParams.method).toBe('GET');
    expect(result.getParams.headers['Content-Type']).toBe('application/json');
    expect(result.getParams.headers['api-secret']).toBeDefined();
    expect(result.getParams.agent).toBeNull();
  });

  test('handles empty apiSecret for GET request', () => {
    const apiSecret = '';
    const isHttps = true;

    const result = createApiParams(apiSecret, isHttps);

    // Check GET parameters with empty apiSecret
    expect(result.getParams.method).toBe('GET');
    expect(result.getParams.headers['Content-Type']).toBe('application/json');
    expect(result.getParams.headers['api-secret']).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
    expect(result.getParams.agent).toBeDefined(); // Assuming agent is always defined for GET
  });

  test('handles non-https scenario', () => {
    const apiSecret = 'yourApiSecret';
    const isHttps = false;

    const result = createApiParams(apiSecret, isHttps);

    // Check GET parameters for non-https scenario
    expect(result.getParams.method).toBe('GET');
    expect(result.getParams.headers['Content-Type']).toBe('application/json');
    expect(result.getParams.headers['api-secret']).toBeDefined();
    expect(result.getParams.agent).toBeNull(); // Assuming agent is null for non-https
  });

  // Add more tests as needed
});
