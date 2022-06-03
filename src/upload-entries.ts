import { removeTrailingSlash, uploadBase } from './utils';
import { Entry, EntryValueType } from './Types';
import moment = require('moment');

export default function (cgmsim: EntryValueType, nsUrl: string, apiSecret: string) {
	const _nsUrl = removeTrailingSlash(nsUrl)
	const api_url = _nsUrl + '/api/v1/entries/';
	const now = moment();
	const entry: Entry = {
		...cgmsim,
		type: 'sgv',
		dateString: now.toISOString(),
		date: now.toDate().getTime(),
	}
	return uploadBase(entry, api_url, apiSecret);
}

