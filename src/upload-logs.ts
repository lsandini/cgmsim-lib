import { removeTrailingSlash, uploadBase } from './utils';
import { SimulationResult } from './Types';
import moment = require('moment');

export default function (simResult: SimulationResult&{notes:string}, nsUrl: string, apiSecret: string) {
	const _nsUrl = removeTrailingSlash(nsUrl)
	const api_url = _nsUrl + '/api/v1/treatments/';
	const now = moment();
	const sim = {
		...simResult,
		type: 'logs',
		dateString: now.toISOString(),
		date: now.toDate().getTime(),
	}
	return uploadBase(sim, api_url, apiSecret);
}

