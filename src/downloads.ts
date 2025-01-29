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
 * Downloads data from the Nightscout API, including treatments, profiles, and glucose entries
 * @param nsUrl - Nightscout base URL
 * @param apiSecret - Nightscout API secret token
 * @returns Promise resolving to an object containing treatments, profiles, and glucose entries
 * @example
 * const apiUrl = "https://nightscout.example.com";
 * const apiSecret = "your-secret-token";
 *
 * downloadNightscoutData(apiUrl, apiSecret)
 *   .then(data => {
 *     console.log("Downloaded data:", data);
 *   })
 *   .catch(error => {
 *     console.error("Download failed:", error);
 *   });
 */
const downloadNightscoutData = async (nsUrl: string, apiSecret: string) => {
	const baseUrl = removeTrailingSlash(nsUrl);
	const useHttps = isHttps(nsUrl);

	const { getParams } = setupParams(apiSecret, useHttps);

	// Define API endpoints
	const treatmentsEndpoint = `${baseUrl}/api/v1/treatments?count=600`;
	const profileEndpoint = `${baseUrl}/api/v1/profile.json`;
	const glucoseEndpoint = `${baseUrl}/api/v1/entries/sgv.json`;

	logger.debug('Fetching data from endpoints:', {
		treatments: treatmentsEndpoint,
		profile: profileEndpoint,
		glucose: glucoseEndpoint,
	});

	// Fetch data from all endpoints concurrently
	const treatmentsPromise = fetchAndParseData<NSTreatment>(fetch(treatmentsEndpoint, getParams));
	const profilesPromise = fetchAndParseData<NSProfile>(fetch(profileEndpoint, getParams));
	const entriesPromise = fetchAndParseData<Sgv>(fetch(glucoseEndpoint, getParams));

	try {
		const [treatments, profiles, entries] = await Promise.all([treatmentsPromise, profilesPromise, entriesPromise]);

		logger.debug('Successfully downloaded data', {
			treatmentsCount: treatments.length,
			profilesCount: profiles.length,
			entriesCount: entries.length,
		});

		return {
			treatments,
			profiles,
			entries,
		};
	} catch (error) {
		logger.error('Failed to download Nightscout data:', error);
		throw new Error(`Download failed: ${error.message}`);
	}
};

export default downloadNightscoutData;
