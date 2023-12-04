import { removeTrailingSlash, loadBase } from './utils';

/**
 * Loads activity data from the Nightscout API based on optional time filter.
 * @param nsUrl - Nightscout URL.
 * @param apiSecret - Nightscout API secret.
 * @param fromUtcString - Optional UTC timestamp to filter data from.
 * @returns A promise that resolves with the loaded activity data.
 * @example
 * // Load activity data from Nightscout
 * const apiUrl = "https://nightscout.example.com";
 * const apiSecret = "apiSecret123";
 * const fromDate = "2023-01-01T00:00:00.000Z"; // Optional UTC timestamp filter
 *
 * loadActivityData(apiUrl, apiSecret, fromDate)
 *   .then((activityData) => {
 *     console.log("Loaded activity data:", activityData);
 *   })
 *   .catch((error) => {
 *     console.error("Error loading activity data:", error);
 *   });
 */
export default function (
	nsUrl: string,
	apiSecret: string,
	fromUtcString: string = null,
) {
	const _nsUrl = removeTrailingSlash(nsUrl);
	const fromFilter = fromUtcString
		? '?find[created_at][$gte]=' + fromUtcString
		: '';
	const api_url = _nsUrl + '/api/v1/activity/' + fromFilter;
	return loadBase(api_url, apiSecret);
}
