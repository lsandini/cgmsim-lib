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
/**
 * Downloads data from the Nightscout API.
 * @param nsUrl - Nightscout URL.
 * @param apiSecret - Nightscout API secret.
 * @param glucoseCount - Optional number of glucose entries to retrieve.
 * @param dataTypes - Optional array of data types to fetch ['treatments', 'profiles', 'entries', 'deviceStatus'].
 * @returns A promise that resolves with the downloaded data.
 * @throws Error if the download fails.
 * @example
 * // Download only entries data from Nightscout
 * downloadNightscoutData("https://nightscout.example.com", "apiSecret123", 20, ['entries'])
 *   .then((data) => {
 *     console.log("Entries downloaded successfully:", data.entries);
 *   })
 *   .catch((error) => {
 *     console.error("Error downloading data:", error);
 *   });
 */
const downloadNightscoutData = async (
  nsUrl: string, 
  apiSecret: string, 
  glucoseCount?: number,
  dataTypes: string[] = ['treatments', 'profiles', 'entries', 'deviceStatus']
) => {
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

	// Only log endpoints we're actually fetching
	const endpointsToFetch = {};
	if (dataTypes.includes('treatments')) endpointsToFetch['treatments'] = treatmentsEndpoint;
	if (dataTypes.includes('profiles')) endpointsToFetch['profile'] = profileEndpoint;
	if (dataTypes.includes('entries')) endpointsToFetch['glucose'] = glucoseEndpoint;
	if (dataTypes.includes('deviceStatus')) endpointsToFetch['deviceStatus'] = deviceStatusEndpoint;

	logger.debug('[downloads] Fetching data from endpoints:', endpointsToFetch);

	// Initialize promises
	let treatmentsPromise = Promise.resolve([]);
	let profilesPromise = Promise.resolve([]);
	let entriesPromise = Promise.resolve([]);
	let deviceStatusPromise = Promise.resolve([]);

	// Only fetch the data types requested
	if (dataTypes.includes('treatments')) {
		treatmentsPromise = fetchAndParseData<NSTreatment>(fetch(treatmentsEndpoint, getParams));
	}
	if (dataTypes.includes('profiles')) {
		profilesPromise = fetchAndParseData<NSProfile>(fetch(profileEndpoint, getParams));
	}
	if (dataTypes.includes('entries')) {
		entriesPromise = fetchAndParseData<Sgv>(fetch(glucoseEndpoint, getParams));
	}
	if (dataTypes.includes('deviceStatus')) {
		deviceStatusPromise = fetchAndParseData<Sgv>(fetch(deviceStatusEndpoint, getParams));
	}

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