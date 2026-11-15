import logger from './logger';
import setupParams from './setupParams';
import { NSProfile, Sgv, NSTreatment } from '../core/types';
import { isHttps, removeTrailingSlash } from '../core/utils';
import fetch from 'node-fetch';

async function fetchAndParseData<T>({ endpoint, apiSecret }: { endpoint: string; apiSecret: string }): Promise<T[]> {
	const useHttps = isHttps(endpoint);
	const { getParams } = setupParams(apiSecret, useHttps);
	const response = await fetch(endpoint, getParams);
	if (response.status === 200) {
		return await response.json();
	} else {
		throw new Error(`API request failed with status ${response.status}`);
	}
}

function validateMaxCount(maxCount?: number): void {
	if (maxCount !== undefined && maxCount > 3000) {
		logger.error(`[downloads] maxCount exceeds the limit: ${maxCount}. It must be <= 3000.`);
		throw new Error('maxCount cannot exceed 3000.');
	}
}

export async function downloadNightscoutEntries(nsUrl: string, apiSecret: string, maxCount?: number): Promise<Sgv[]> {
	validateMaxCount(maxCount);

	const baseUrl = removeTrailingSlash(nsUrl);
	const endpoint = maxCount
		? `${baseUrl}/api/v1/entries/sgv.json?count=${maxCount}`
		: `${baseUrl}/api/v1/entries/sgv.json`;

	logger.debug('[downloads] Fetching entries from:', endpoint);

	return fetchAndParseData<Sgv>({ endpoint, apiSecret });
}

export async function downloadNightscoutProfiles(
	nsUrl: string,
	apiSecret: string,
	maxCount?: number,
): Promise<NSProfile[]> {
	validateMaxCount(maxCount);

	const baseUrl = removeTrailingSlash(nsUrl);
	const endpoint = maxCount ? `${baseUrl}/api/v1/profile.json?count=${maxCount}` : `${baseUrl}/api/v1/profile.json`;

	logger.debug('[downloads] Fetching profiles from:', endpoint);

	return fetchAndParseData<NSProfile>({ endpoint, apiSecret });
}

export async function downloadNightscoutTreatments(
	nsUrl: string,
	apiSecret: string,
	maxCount?: number,
): Promise<NSTreatment[]> {
	validateMaxCount(maxCount);

	const baseUrl = removeTrailingSlash(nsUrl);
	const endpoint = maxCount
		? `${baseUrl}/api/v1/treatments.json?count=${maxCount}`
		: `${baseUrl}/api/v1/treatments.json`;

	logger.debug('[downloads] Fetching treatments from:', endpoint);

	return fetchAndParseData<NSTreatment>({ endpoint, apiSecret });
}

/**
 * Downloads the most recent device status from the Nightscout API.
 *
 * Only the latest item is ever requested (`count=1`; Nightscout sorts devicestatus newest-first).
 * The result is still an array, for backward compatibility with cgmsim-lib <= 0.10.3, whose callers use
 * `deviceStatus.length`, `deviceStatus[0]` and `deviceStatus.sort(...)`.
 *
 * @param nsUrl - Nightscout URL
 * @param apiSecret - Nightscout API secret
 * @param maxCount - Accepted for signature compatibility with 0.10.3 and validated (<= 3000), but ignored:
 *   at most one device status is returned.
 * @returns An array containing the latest device status, or an empty array if none exists.
 */
export async function downloadNightscoutDeviceStatus(
	nsUrl: string,
	apiSecret: string,
	maxCount?: number,
): Promise<any[]> {
	validateMaxCount(maxCount);

	const baseUrl = removeTrailingSlash(nsUrl);
	const endpoint = `${baseUrl}/api/v1/devicestatus.json?count=1`;

	logger.debug('[downloads] Fetching latest device status from:', endpoint);

	const result = await fetchAndParseData<any>({ endpoint, apiSecret });
	return Array.isArray(result) ? result.slice(0, 1) : [];
}

export default async function downloads(nsUrl: string, apiSecret: string, maxCount?: number) {
	validateMaxCount(maxCount);

	try {
		const [entries, treatments, profiles, deviceStatus] = await Promise.all([
			downloadNightscoutEntries(nsUrl, apiSecret, maxCount),
			downloadNightscoutTreatments(nsUrl, apiSecret, maxCount),
			downloadNightscoutProfiles(nsUrl, apiSecret, maxCount),
			downloadNightscoutDeviceStatus(nsUrl, apiSecret),
		]);

		logger.debug('[downloads] Successfully downloaded data: %o', {
			entriesCount: entries.length,
			treatmentsCount: treatments.length,
			profilesCount: profiles.length,
			deviceStatusCount: deviceStatus.length,
		});

		return {
			entries,
			treatments,
			profiles,
			deviceStatus,
		};
	} catch (error) {
		logger.error('[downloads] Failed to download Nightscout data: %o', error);
		throw new Error(`Download failed: ${error instanceof Error ? error.message : String(error)}`);
	}
}
