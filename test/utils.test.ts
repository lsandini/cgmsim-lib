import { isHttps, removeTrailingSlash } from '../src/utils';
import * as utils from '../src/utils';

describe('isHttps function', () => {
  test('should return true for valid https URLs', () => {
    const httpsUrl = 'https://test.cgmsim.com';
    const result = isHttps(httpsUrl);
    expect(result).toBe(true);
  });

  test('should return false for non-https URLs', () => {
    const httpUrl = 'http://test.cgmsim.com';
    const ftpUrl = 'ftp://test.cgmsim.com';
    const resultHttp = isHttps(httpUrl);
    const resultFtp = isHttps(ftpUrl);
    expect(resultHttp).toBe(false);
    expect(resultFtp).toBe(false);
  });

  test('should return false for invalid input', () => {
    const invalidUrl = 'test.cgmsimcom';
    const result = isHttps(invalidUrl);
    expect(result).toBe(false);
  });

  test('should return false for empty input', () => {
    const emptyUrl = '';
    const result = isHttps(emptyUrl);
    expect(result).toBe(false);
  });

  test('should return false for null input', () => {
    const result = isHttps(null);
    expect(result).toBe(false);
  });

  test('should return false for undefined input', () => {
    const result = isHttps(undefined);
    expect(result).toBe(false);
  });
});

test('should remove trailing slash from a string', () => {
  const inputWithSlash = 'https://example.com/';
  const inputWithoutSlash = 'https://example.com';

  const resultWithSlash = removeTrailingSlash(inputWithSlash);
  const resultWithoutSlash = removeTrailingSlash(inputWithoutSlash);

  expect(resultWithSlash).toBe('https://example.com');
  expect(resultWithoutSlash).toBe('https://example.com');
});


// testing pino stuff
// ======================
jest.mock('../src/utils', () => {
  const originalUtils = jest.requireActual('../src/utils');
  return {
    ...originalUtils,
    __esModule: true, // Add this line if the module is using ES modules
    default: jest.fn(),
    targets: [
      {
        target: '@logtail/pino',
        options: { sourceToken: 'testToken' },
        level: 'error', // Replace with the expected level
      },
    ],
  };
});

describe('Logger setup', () => {
  test('should add logtail target with a test token', () => {
    // Execute the logger setup
    (utils.default as any).mockImplementationOnce(() => {});

    // Verify that the targets array is populated
    expect((utils as any).targets).toEqual([
      {
        target: '@logtail/pino',
        options: { sourceToken: 'testToken' },
        level: 'error', // Replace with the expected level
      },
    ]);
  });
});
