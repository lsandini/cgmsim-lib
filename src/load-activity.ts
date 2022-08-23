import { Activity } from './Types';
import { removeTrailingSlash,loadBase } from './utils';

export default function (activity: Activity, nsUrl: string, apiSecret: string) {
	const _nsUrl = removeTrailingSlash(nsUrl)
	const api_url = _nsUrl + '/api/v1/activity/';
	return loadBase(activity, api_url, apiSecret);

}