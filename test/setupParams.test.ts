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

  test('handles empty apiSecret for POST request', () => {
    const apiSecret = '';
    const isHttps = true;
  
    const result = createApiParams(apiSecret, isHttps);
  
    // Check POST parameters with empty apiSecret
    expect(result.postParams.method).toBe('POST'); // Corrected line
    expect(result.postParams.headers['Content-Type']).toBe('application/json'); // Corrected line
    expect(result.postParams.headers['api-secret']).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709'); // Corrected line
    expect(result.postParams.agent).toBeDefined(); // Assuming agent is always defined for POST
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

  test('handles undefined isHttps scenario', () => {
    const apiSecret = 'yourApiSecret';
    const isHttps = undefined; // or omitting the parameter, either way it's undefined

    const result = createApiParams(apiSecret, isHttps);

    // Check GET parameters for undefined isHttps scenario
    expect(result.getParams.method).toBe('GET');
    expect(result.getParams.headers['Content-Type']).toBe('application/json');
    expect(result.getParams.headers['api-secret']).toBeDefined();
    expect(result.getParams.agent).toBeNull(); // Assuming agent is null when isHttps is undefined
  });

});
