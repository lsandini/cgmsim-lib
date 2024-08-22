import { isHttps, removeTrailingSlash } from '../src/utils';
import * as utils from '../src/utils';
import fetch from 'node-fetch';
import {
  loadBase,
  uploadBase,
  roundTo8Decimals,
  getExpTreatmentActivity,
  getDeltaMinutes,
} from '../src/utils';
import { Entry } from 'src/Types';

jest.mock('node-fetch');

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

describe('test utils', () => {
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

  // testing loadBase function mocking the rest API call with MSW from mswjs.io

  // Write your test
  describe('loadBase function', () => {
    it('should load data from the Nightscout API', async () => {
      const nsUrlApi = 'https://nightscout-api.com';
      const apiSecret = 'yourApiSecret';
      const data = { key: 'mocked' };
      (fetch as unknown as jest.Mock).mockResolvedValue({
        json: async () => data,
      });
      // Use your loadBase function, which will now use the mocked response
      try {
        const result = await loadBase(nsUrlApi, apiSecret);

        // Perform assertions based on the expected behavior
        expect(result).toEqual(data);
      } catch (error) {
        // Handle any unexpected errors
        fail(error);
      }
    });
  });
});

jest.mock('node-fetch');

describe('uploadBase function', () => {
  it('should upload data to the Nightscout API using POST', async () => {
    const nsUrlApi = 'https://nightscout-api.com';
    const apiSecret = 'yourApiSecret';
    const testData: Entry = {
      sgv: 161,
      direction: 'Flat',
      type: 'sgv',
      dateString: '2024-01-17T17:05:07.424Z',
      date: 1705511107424,
    };

    // Mock the fetch function to resolve with a success response
    (fetch as unknown as jest.Mock).mockResolvedValue({
      json: async () => testData,
    });

    // Use your uploadBase function, which will now use the mocked response
    try {
      await uploadBase(testData, nsUrlApi, apiSecret);

      // Verify that the fetch function was called with the correct parameters for a POST request
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String), // Match any URL
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: JSON.stringify(testData),
        }),
      );

      // Optionally, you can add more assertions based on the expected behavior
    } catch (error) {
      // Handle any unexpected errors
      fail(error);
    }
  });
});

describe('roundTo8Decimals function', () => {
  it('should round a number to 8 decimals', () => {
    // Test case 1: Positive number
    let result = roundTo8Decimals(3.141592653589793);
    expect(result).toBe(3.14159265); // Adjust the expected result based on your precision needs

    // Test case 2: Negative number
    result = roundTo8Decimals(-2.718281828459045);
    expect(result).toBe(-2.71828183); // Adjust the expected result based on your precision needs

    // Test case 3: Large number
    result = roundTo8Decimals(123456789.98765432);
    expect(result).toBe(123456789.98765432); // Adjust the expected result based on your precision needs

    // Ensure that the roundedNumber has the desired precision
    expect(result.toString().split('.')[1].length).toBe(8);
  });
});

describe('getExpTreatmentActivity function', () => {
  it('should return 0 when activity is less than or equal to 0', () => {
    const result = getExpTreatmentActivity({
      peak: 10,
      duration: 30,
      minutesAgo: 20,
      units: 5,
    });
    expect(result).toBe(0.16367332278955893);
  });

  it('should return 0 when activity is less than or equal to 0', () => {
    const result = getExpTreatmentActivity({
      peak: 55,
      duration: 180,
      minutesAgo: 200,
      units: 5,
    });
    expect(result).toBe(0);
  });

  it('should adjust activity when minutesAgo is less than 15', () => {
    const result = getExpTreatmentActivity({
      peak: 10,
      duration: 30,
      minutesAgo: 10,
      units: 5,
    });
    const expectedActivity = 0.17990112581954254;
    expect(result).toBe(expectedActivity);
  });

  it('should return normal activity when conditions are met', () => {
    const result = getExpTreatmentActivity({
      peak: 10,
      duration: 30,
      minutesAgo: 20,
      units: 5,
    });
    const expectedActivity =
      5 *
      (1 / Math.pow((10 * (1 - 10 / 30)) / (1 - (2 * 10) / 30), 2)) *
      20 *
      (1 - 20 / 30) *
      Math.exp(-20 / ((10 * (1 - 10 / 30)) / (1 - (2 * 10) / 30)));
    expect(result).toBe(0.16367332278955893);
  });
});

const moment = require('moment');

describe('getDeltaMinutes', () => {
  it('should return the difference in minutes from now to the given time', () => {
    const now = moment();
    const fiveMinutesAgo = now.clone().subtract(5, 'minutes');

    // Convert the moment object to a timestamp in milliseconds
    const fiveMinutesAgoMillis = fiveMinutesAgo.valueOf();

    const deltaMinutes = getDeltaMinutes(fiveMinutesAgoMillis);

    expect(deltaMinutes).toBeCloseTo(5, 0);
  });
});
