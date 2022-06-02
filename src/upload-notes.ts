import { removeTrailingSlash, uploadBase } from './utils';
import { Note } from './Types';

export default function (notes: string, nsUrl: string, apiSecret: string) {	
	const _nsUrl = removeTrailingSlash(nsUrl)
	const api_url = _nsUrl + '/api/v1/treatments/';
	const noteTreatment:Note={type:'Note', notes}
	return uploadBase(noteTreatment, api_url, apiSecret);
}

