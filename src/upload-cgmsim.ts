import { uploadBase } from './utils';
import { Sgv } from './Types';

export default function (cgmsim: Sgv, nsUrl: string, apiSecret: string) {
	const api_url = nsUrl + '/api/v1/entries/';
	return uploadBase(cgmsim, api_url, apiSecret);
}

