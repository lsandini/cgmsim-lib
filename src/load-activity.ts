import { Activity } from './Types';
import { removeTrailingSlash, loadBase } from './utils';

export default function (
	nsUrl: string,
	apiSecret: string,
	fromUtcString: string = null
) {
	const _nsUrl = removeTrailingSlash(nsUrl);
	const fromFilter = fromUtcString
		? '?find[created_at][$gte]=' + fromUtcString
		: '';
	const api_url = _nsUrl + '/api/v1/activity/' + fromFilter;
	return loadBase(api_url, apiSecret);
}
