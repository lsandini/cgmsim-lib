import getLogger, { isHttps, removeTrailingSlash } from './utils';
import setupParams from './setupParams';
import { NSProfile, Sgv, NSTreatment } from './Types';
import fetch, { Response } from 'node-fetch';

async function fetchCast<T>(fetchData: Promise<Response>): Promise<T[]> {
	const response = await fetchData;
	if (response.status === 200) {
		const data: T[] = await response.json();
		return data;
	} else {
		throw new Error('Request error');
	}
}

/**
 * Downloads data from the Nightscout API, including treatments, profiles, and entries.
 * @param nsUrl - Nightscout URL.
 * @param apiSecret - Nightscout API secret.
 * @returns A promise that resolves with downloaded data.
 * @example
 * // Download data from Nightscout API
 * const apiUrl = "https://nightscout.example.com";
 * const apiSecret = "apiSecret123";
 *
 * downloads(apiUrl, apiSecret)
 *   .then((downloadedData) => {
 *     console.log("Downloaded data:", downloadedData);
 *   })
 *   .catch((error) => {
 *     console.error("Error downloading data:", error);
 *   });
 */
const downloads = async (nsUrl: string, apiSecret: string) => {
	const _nsUrl = removeTrailingSlash(nsUrl);
	const _isHttps = isHttps(nsUrl);

	const { getParams } = setupParams(apiSecret, _isHttps);
	const api_url = _nsUrl + '/api/v1/treatments?count=600';
	const api_profile = _nsUrl + '/api/v1/profile.json';
	const api_sgv = _nsUrl + '/api/v1/entries/sgv.json';

	const treatments = fetchCast<NSTreatment>(fetch(api_url, getParams));
	const profiles = fetchCast<NSProfile>(fetch(api_profile, getParams));
	const entries = fetchCast<Sgv>(fetch(api_sgv, getParams));

	return Promise.all([treatments, profiles, entries])
		.then(([treatments, profiles, entries]) => {
			return {
				treatments,
				profiles,
				entries,
			};
		})
		.catch((err) => {
			getLogger().error(err);
			throw new Error(err);
		});
};

export default downloads;
