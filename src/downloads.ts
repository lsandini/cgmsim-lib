import logger, { isHttps, removeTrailingSlash } from './utils';
import setupParams from './setupParams';
import { NSProfile, Sgv, NSTreatment } from './Types';
import fetch, { Response } from 'node-fetch';

/**
 * Fetches and parses JSON data from a Nightscout API endpoint
 * @param endpoint - The API endpoint to fetch data from
 * @param getParams - The fetch parameters
 * @returns A promise resolving to an array of parsed data
 * @throws Error if the request fails
 */
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

/**
 * Validates the maxCount parameter to ensure it does not exceed 3000.
 * Logs an error if the validation fails.
 * @param maxCount - The maximum number of items to retrieve.
 */
function validateMaxCount(maxCount?: number): void {
	if (maxCount !== undefined && maxCount > 3000) {
		logger.error(`[downloads] maxCount exceeds the limit: ${maxCount}. It must be <= 3000.`);
		throw new Error('maxCount cannot exceed 3000.');
	}
}

/**
 * Downloads entries (glucose data) from the Nightscout API.
 * @param nsUrl - Nightscout URL
 * @param apiSecret - Nightscout API secret
 * @param maxCount - Optional number of glucose entries to retrieve
 * @returns A promise resolving to an array of entries
 */
export async function downloadNightscoutEntries(nsUrl: string, apiSecret: string, maxCount?: number): Promise<Sgv[]> {
	validateMaxCount(maxCount);

	const baseUrl = removeTrailingSlash(nsUrl);
	const endpoint = maxCount
		? `${baseUrl}/api/v1/entries/sgv.json?count=${maxCount}`
		: `${baseUrl}/api/v1/entries/sgv.json`;

	logger.debug('[downloads] Fetching entries from:', endpoint);

	return fetchAndParseData<Sgv>({ endpoint, apiSecret });
}

/**
 * Downloads profiles from the Nightscout API.
 * @param nsUrl - Nightscout URL
 * @param apiSecret - Nightscout API secret
 * @param maxCount - Optional number of profiles to retrieve
 * @returns A promise resolving to an array of profiles
 */
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

/**
 * Downloads treatments from the Nightscout API.
 * @param nsUrl - Nightscout URL
 * @param apiSecret - Nightscout API secret
 * @param maxCount - Optional number of treatments to retrieve
 * @returns A promise resolving to an array of treatments
 */
export async function downloadNightscoutTreatments(
	nsUrl: string,
	apiSecret: string,
	maxCount?: number,
): Promise<NSTreatment[]> {
	validateMaxCount(maxCount);

	const baseUrl = removeTrailingSlash(nsUrl);
	const endpoint = maxCount ? `${baseUrl}/api/v1/treatments?count=${maxCount}` : `${baseUrl}/api/v1/treatments`;

	logger.debug('[downloads] Fetching treatments from:', endpoint);

	return fetchAndParseData<NSTreatment>({ endpoint, apiSecret });
}

/**
 * Downloads device status from the Nightscout API.
 * @param nsUrl - Nightscout URL
 * @param apiSecret - Nightscout API secret
 * @param maxCount - Optional number of device statuses to retrieve
 * @returns A promise resolving to an array of device statuses
 */
export async function downloadNightscoutDeviceStatus(
	nsUrl: string,
	apiSecret: string,
	maxCount?: number,
): Promise<any[]> {
	validateMaxCount(maxCount);

	const baseUrl = removeTrailingSlash(nsUrl);
	const endpoint = maxCount
		? `${baseUrl}/api/v1/devicestatus.json?count=${maxCount}`
		: `${baseUrl}/api/v1/devicestatus.json`;

	logger.debug('[downloads] Fetching device status from:', endpoint);

	return fetchAndParseData<any>({ endpoint, apiSecret });
}

/**
 * Downloads data from the Nightscout API.
 * @param nsUrl - Nightscout URL.
 * @param apiSecret - Nightscout API secret.
 * @param maxCount - Optional number of items to retrieve for each data type.
 * @returns A promise that resolves with the downloaded data.
 * @throws Error if the download fails.
 */
const downloadNightscoutData = async (nsUrl: string, apiSecret: string, maxCount?: number) => {
	validateMaxCount(maxCount);

	const treatmentsPromise = downloadNightscoutTreatments(nsUrl, apiSecret, maxCount);
	const profilesPromise = downloadNightscoutProfiles(nsUrl, apiSecret, maxCount);
	const entriesPromise = downloadNightscoutEntries(nsUrl, apiSecret, maxCount);
	const deviceStatusPromise = downloadNightscoutDeviceStatus(nsUrl, apiSecret, maxCount);

	try {
		const [treatments, profiles, entries, deviceStatus] = await Promise.all([
			treatmentsPromise,
			profilesPromise,
			entriesPromise,
			deviceStatusPromise,
		]);

		logger.debug('[downloads] Successfully downloaded data', {
			treatmentsCount: treatments.length,
			profilesCount: profiles.length,
			entriesCount: entries.length,
			deviceStatusCount: deviceStatus.length,
		});

		return {
			treatments,
			profiles,
			entries,
			deviceStatus,
		};
	} catch (error) {
		logger.error('[downloads] Failed to download Nightscout data:', error);
		throw new Error(`Download failed: ${error.message}`);
	}
};

export default downloadNightscoutData;
