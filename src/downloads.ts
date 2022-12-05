import logger, { isHttps, removeTrailingSlash } from './utils';
import setupParams from './setupParams';
import { Profile, Sgv, Treatment } from './Types';
import fetch from 'node-fetch';
//const logger = pino();



const downloads = async (nsUrl: string, apiSecret: string, instanceName: string) => {
	const _nsUrl = removeTrailingSlash(nsUrl)
	const _isHttps = isHttps(nsUrl);

	const { getParams } = setupParams(apiSecret, _isHttps, instanceName);
	const api_url = _nsUrl + '/api/v1/treatments?count=600';
	const api_profile = _nsUrl + '/api/v1/profile.json';
	const api_sgv = _nsUrl + '/api/v1/entries/sgv.json';

	const treatments: { json: () => Promise<Treatment[]> } = fetch(api_url, getParams)
	const profiles: { json: () => Promise<Profile[]> } = fetch(api_profile, getParams)
	const entries: { json: () => Promise<Sgv[]> } = fetch(api_sgv, getParams)
	return Promise.all([treatments, profiles, entries])
		.then(([resTreatments, resProfile, resEntries]) => {
			return Promise.all([resTreatments.json(), resProfile.json(), resEntries.json()])
		})
		.then(([treatments, profiles, entries,]) => {
			return {
				treatments,
				profiles,
				entries,
			};
		})
		.catch(err => {
			logger.error(err);
			throw new Error(err);
		});

};
export default downloads;