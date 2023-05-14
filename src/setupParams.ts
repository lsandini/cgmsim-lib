const { createHash } = require('crypto');
const https = require('https');

export default function (
	apiSecret: string,
	isHttps: boolean = true,
	instanceName = null
) {
	const agent = isHttps
		? new https.Agent({ rejectUnauthorized: false })
		: null;
	const hash = createHash('sha1');
	hash.update(apiSecret);

	const hash_secret = hash.digest('hex');

	const headers = {
		'Content-Type': 'application/json',
		'api-secret': hash_secret,
		cookie: instanceName ? 'instance=' + instanceName : null,
	};
	return {
		getParams: {
			method: 'GET',
			headers,
			agent,
		},
		postParams: {
			method: 'POST',
			headers,
			agent,
		},
	};
}
