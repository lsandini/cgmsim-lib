import logger from './utils';
import setupParams from './setupParams';
import { Profile, Sgv, Treatment } from './Types';

//const logger = pino();
const fetch = require('node-fetch');

const downloads = async (nsUrl: string, apiSecret: string) => {
	const isHttps = nsUrl.match(/^https/)?.length > 0;

	const { getParams } = setupParams(apiSecret,isHttps);
	const api_url = nsUrl + '/api/v1/treatments';
	const api_profile = nsUrl + '/api/v1/profile.json';
	const api_sgv = nsUrl + '/api/v1/entries/sgv.json';

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