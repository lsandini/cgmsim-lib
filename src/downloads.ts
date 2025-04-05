import logger, { isHttps, removeTrailingSlash } from './utils';
import setupParams from './setupParams';
import { NSProfile, Sgv, NSTreatment } from './Types';
import fetch, { Response } from 'node-fetch';

/**
 * Fetches and parses JSON data from a Nightscout API endpoint
 * @param fetchData - Promise containing the fetch request
 * @returns Promise resolving to an array of parsed data
 * @throws Error if the request fails
 */
async function fetchAndParseData<T>(fetchData: Promise<Response>): Promise<T[]> {
	const response = await fetchData;
	if (response.status === 200) {
		const data: T[] = await response.json();
		return data;
	} else {
		throw new Error('API request failed');
	}
}

/**
 * Downloads data from the Nightscout API.
 * @param nsUrl - Nightscout URL.
 * @param apiSecret - Nightscout API secret.
 * @param glucoseCount - Optional number of glucose entries to retrieve.
 * @returns A promise that resolves with the downloaded data.
 * @throws Error if the download fails.
 * @example
 * // Download data from Nightscout with default glucose count
 * downloadNightscoutData("https://nightscout.example.com", "apiSecret123")
 *   .then((data) => {
 *     console.log("Data downloaded successfully:", data);
 *   })
 *   .catch((error) => {
 *     console.error("Error downloading data:", error);
 *   });
 * 
 * // Download data from Nightscout with custom glucose count
 * downloadNightscoutData("https://nightscout.example.com", "apiSecret123", 20)
 *   .then((data) => {
 *     console.log("Data downloaded successfully:", data);
 *   })
 *   .catch((error) => {
 *     console.error("Error downloading data:", error);
 *   });
 */
const downloadNightscoutData = async (nsUrl: string, apiSecret: string, glucoseCount?: number) => {
	const baseUrl = removeTrailingSlash(nsUrl);
	const useHttps = isHttps(nsUrl);

	const { getParams } = setupParams(apiSecret, useHttps);

	// Define API endpoints
	const treatmentsEndpoint = `${baseUrl}/api/v1/treatments?count=600`;
	const profileEndpoint = `${baseUrl}/api/v1/profile.json`;
	const glucoseEndpoint = glucoseCount 
		? `${baseUrl}/api/v1/entries/sgv.json?count=${glucoseCount}`
		: `${baseUrl}/api/v1/entries/sgv.json`;
	const deviceStatusEndpoint = `${baseUrl}/api/v1/devicestatus.json`;

	logger.debug('[downloads] Fetching data from endpoints:', {
		treatments: treatmentsEndpoint,
		profile: profileEndpoint,
		glucose: glucoseEndpoint,
		deviceStatus: deviceStatusEndpoint,
	});

	// Fetch data from all endpoints concurrently
	const treatmentsPromise = fetchAndParseData<NSTreatment>(fetch(treatmentsEndpoint, getParams));
	const profilesPromise = fetchAndParseData<NSProfile>(fetch(profileEndpoint, getParams));
	const entriesPromise = fetchAndParseData<Sgv>(fetch(glucoseEndpoint, getParams));
	const deviceStatusPromise = fetchAndParseData<Sgv>(fetch(deviceStatusEndpoint, getParams));

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
