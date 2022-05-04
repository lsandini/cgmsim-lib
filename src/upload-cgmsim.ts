import fetch from 'node-fetch';
import logger from './utils';
import setupParams from './setupParams';
import { Sgv } from './Types';

//const logger = pino();

export default function (cgmsim: Sgv, nsUrl: string, apiSecret: string) {
	const { postParams } = setupParams(apiSecret);

	const api_url = nsUrl + '/api/v1/entries/';
	const body_json = JSON.stringify(cgmsim);

	return fetch(api_url, {
		...postParams,
		body: body_json,
	})
		.then(() => {
			logger.info('NIGTHSCOUT Updated');
		})
		.catch(err => {
			logger.info(err);
		});
}