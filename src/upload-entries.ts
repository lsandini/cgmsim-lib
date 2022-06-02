import { removeTrailingSlash, uploadBase } from './utils';
import { Sgv } from './Types';

export default function (cgmsim: Sgv, nsUrl: string, apiSecret: string) {
	const _nsUrl = removeTrailingSlash(nsUrl)
	const api_url = _nsUrl + '/api/v1/entries/';
	return uploadBase(cgmsim, api_url, apiSecret);
}

