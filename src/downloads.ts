import logger, { isHttps, removeTrailingSlash } from './utils';
import setupParams from './setupParams';
import { Profile, Sgv, Treatment } from './Types';
import fetch from 'node-fetch';
//const logger = pino();



const downloads = async (nsUrl: string, apiSecret: string) => {
	const _nsUrl = removeTrailingSlash(nsUrl)
	const _isHttps = isHttps(nsUrl);

	const { getParams } = setupParams(apiSecret, _isHttps);
	const api_url = _nsUrl + '/api/v1/treatments';
	const api_profile = _nsUrl + '/api/v1/profile.json';
	const api_sgv = _nsUrl + '/api/v1/entries/sgv.json';

	const treatments: Treatment[] = await fetch(api_url, getParams)
		.then(resTreatments => resTreatments.json())
		.catch(err => logger.error(err));

	const profiles: Profile[] = await fetch(api_profile, getParams)
		.then(resProfile => resProfile.json());

	const entries: Sgv[] = await fetch(api_sgv, getParams)
		.then(resSGV => resSGV.json());

	return {
		treatments,
		profiles,
		entries,
	};
};
export default downloads;