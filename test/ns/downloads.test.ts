import fetch from 'node-fetch';
import downloads, {
  downloadNightscoutDeviceStatus,
  downloadNightscoutEntries,
  downloadNightscoutProfiles,
  downloadNightscoutTreatments,
} from '../../src/ns/downloads';
import * as rootExports from '../../src';
import * as legacyDownloads from '../../src/downloads';

jest.mock('node-fetch');
const mockFetch = fetch as unknown as jest.Mock;

const NS_URL = 'https://ns.example.com/';
const SECRET = 'secret';

const jsonResponse = (body: unknown, status = 200) => ({
  status,
  json: jest.fn().mockResolvedValue(body),
});

const latestStatus = {
  created_at: '2026-11-15T10:05:00.000Z',
  openaps: {
    openaps: { iob: 1.2, time: '2026-11-15T10:05:00.000Z', basaliob: 0.4, bolusiob: 0.8 },
    suggested: { COB: 20, timestamp: '2026-11-15T10:05:00.000Z' },
  },
};

/** Routes mocked fetch calls by endpoint path. */
function routeFetch(routes: Record<string, unknown>) {
  mockFetch.mockImplementation(async (url: string) => {
    const key = Object.keys(routes).find((path) => url.includes(path));
    if (!key) throw new Error(`Unexpected URL ${url}`);
    return jsonResponse(routes[key]);
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('downloadNightscoutDeviceStatus', () => {
  it('requests only the most recent item (count=1) and strips trailing slash', async () => {
    mockFetch.mockResolvedValue(jsonResponse([latestStatus]));

    await downloadNightscoutDeviceStatus(NS_URL, SECRET);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe('https://ns.example.com/api/v1/devicestatus.json?count=1');
  });

  it('returns an array (0.10.3 shape) containing only the latest item', async () => {
    mockFetch.mockResolvedValue(jsonResponse([latestStatus]));

    const result = await downloadNightscoutDeviceStatus(NS_URL, SECRET);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([latestStatus]);
  });

  it('returns only the first item if the server ignores count and sends several', async () => {
    const older = { ...latestStatus, created_at: '2026-11-15T10:00:00.000Z' };
    mockFetch.mockResolvedValue(jsonResponse([latestStatus, older]));

    expect(await downloadNightscoutDeviceStatus(NS_URL, SECRET)).toEqual([latestStatus]);
  });

  it('returns an empty array when there is no device status', async () => {
    mockFetch.mockResolvedValue(jsonResponse([]));

    expect(await downloadNightscoutDeviceStatus(NS_URL, SECRET)).toEqual([]);
  });

  it('accepts the 0.10.3 maxCount argument but still requests only count=1', async () => {
    mockFetch.mockResolvedValue(jsonResponse([latestStatus]));

    const result = await downloadNightscoutDeviceStatus(NS_URL, SECRET, 100);

    expect(mockFetch.mock.calls[0][0]).toBe('https://ns.example.com/api/v1/devicestatus.json?count=1');
    expect(result).toHaveLength(1);
  });

  it('still rejects maxCount above 3000, like 0.10.3', async () => {
    await expect(downloadNightscoutDeviceStatus(NS_URL, SECRET, 3001)).rejects.toThrow('maxCount cannot exceed 3000.');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws on non-200 responses', async () => {
    mockFetch.mockResolvedValue(jsonResponse(null, 401));

    await expect(downloadNightscoutDeviceStatus(NS_URL, SECRET)).rejects.toThrow('API request failed with status 401');
  });
});

describe('individual downloaders', () => {
  it.each([
    [downloadNightscoutEntries, '/api/v1/entries/sgv.json'],
    [downloadNightscoutTreatments, '/api/v1/treatments.json'],
    [downloadNightscoutProfiles, '/api/v1/profile.json'],
  ])('%p hits %s with and without maxCount', async (fn, path) => {
    mockFetch.mockResolvedValue(jsonResponse([]));

    await fn(NS_URL, SECRET);
    await fn(NS_URL, SECRET, 50);

    expect(mockFetch.mock.calls[0][0]).toBe(`https://ns.example.com${path}`);
    expect(mockFetch.mock.calls[1][0]).toBe(`https://ns.example.com${path}?count=50`);
  });

  it('rejects maxCount above 3000 without calling fetch', async () => {
    await expect(downloadNightscoutEntries(NS_URL, SECRET, 3001)).rejects.toThrow('maxCount cannot exceed 3000.');
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('downloads (default)', () => {
  it('returns entries, treatments, profiles and deviceStatus as a one-item array', async () => {
    const entries = [{ sgv: 120 }];
    const treatments = [{ eventType: 'Meal Bolus' }];
    const profiles = [{ defaultProfile: 'Default' }];
    routeFetch({
      '/entries/sgv.json': entries,
      '/treatments.json': treatments,
      '/profile.json': profiles,
      '/devicestatus.json': [latestStatus],
    });

    const result = await downloads(NS_URL, SECRET, 10);

    expect(result).toEqual({ entries, treatments, profiles, deviceStatus: [latestStatus] });
    expect(mockFetch).toHaveBeenCalledTimes(4);
    const deviceUrl = mockFetch.mock.calls.map((c) => c[0]).find((u: string) => u.includes('devicestatus'));
    // maxCount applies to the other collections, never to deviceStatus
    expect(deviceUrl).toBe('https://ns.example.com/api/v1/devicestatus.json?count=1');
  });

  it('returns deviceStatus: [] when none exists', async () => {
    routeFetch({
      '/entries/sgv.json': [],
      '/treatments.json': [],
      '/profile.json': [],
      '/devicestatus.json': [],
    });

    const result = await downloads(NS_URL, SECRET);

    expect(result.deviceStatus).toEqual([]);
  });

  it('wraps failures as "Download failed: ..."', async () => {
    mockFetch.mockImplementation(async (url: string) =>
      url.includes('devicestatus') ? jsonResponse(null, 500) : jsonResponse([]),
    );

    await expect(downloads(NS_URL, SECRET)).rejects.toThrow('Download failed: API request failed with status 500');
  });

  it('rejects maxCount above 3000 before any request', async () => {
    await expect(downloads(NS_URL, SECRET, 5000)).rejects.toThrow('maxCount cannot exceed 3000.');
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('backward compatibility with 0.10.3 callers', () => {
  const routes = (deviceStatus: unknown[]) => ({
    '/entries/sgv.json': [],
    '/treatments.json': [],
    '/profile.json': [],
    '/devicestatus.json': deviceStatus,
  });

  it('returns the same top-level keys as 0.10.3', async () => {
    routeFetch(routes([latestStatus]));

    const result = await downloads(NS_URL, SECRET);

    expect(Object.keys(result).sort()).toEqual(['deviceStatus', 'entries', 'profiles', 'treatments']);
  });

  it('supports the `length > 0 ? deviceStatus[0] : null` pattern', async () => {
    routeFetch(routes([latestStatus]));

    const down = await downloads(NS_URL, SECRET);
    const deviceStatus = down.deviceStatus && down.deviceStatus.length > 0 ? down.deviceStatus[0] : null;

    expect(deviceStatus).toEqual(latestStatus);
  });

  it('supports sorting deviceStatus by created_at', async () => {
    routeFetch(routes([latestStatus]));

    const down = await downloads(NS_URL, SECRET);
    let latest = null;
    if (down?.deviceStatus?.length > 0) {
      latest = down.deviceStatus.sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )[0];
    }

    expect(latest).toEqual(latestStatus);
  });

  it('handles an empty deviceStatus the same way as 0.10.3', async () => {
    routeFetch(routes([]));

    const down = await downloads(NS_URL, SECRET);
    const deviceStatus = down.deviceStatus && down.deviceStatus.length > 0 ? down.deviceStatus[0] : null;

    expect(deviceStatus).toBeNull();
  });
});

describe('public exports', () => {
  it('exposes downloadNightscoutDeviceStatus from the package root and legacy path', () => {
    expect((rootExports as any).downloadNightscoutDeviceStatus).toBe(downloadNightscoutDeviceStatus);
    expect(legacyDownloads.downloadNightscoutDeviceStatus).toBe(downloadNightscoutDeviceStatus);
    expect(legacyDownloads.default).toBe(downloads);
  });
});
