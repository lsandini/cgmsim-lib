import { removeTrailingSlash, uploadBase } from './utils';
import { Entry, EntryValueType } from './Types';

export default function (cgmsim: EntryValueType, nsUrl: string, apiSecret: string) {
	const _nsUrl = removeTrailingSlash(nsUrl)
	const api_url = _nsUrl + '/api/v1/entries/';
	const entry:Entry={
		...cgmsim,
		type:'sgv',
		date:new Date().getTime(),
	}
	return uploadBase(entry, api_url, apiSecret);
}

