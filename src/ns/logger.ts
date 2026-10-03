import pino, { LevelWithSilent, TransportTargetOptions } from 'pino';
import { load } from 'ts-dotenv';

const env = load({
	LOGTAIL_SECRET: { type: String, optional: true },
	LOGTAIL_HOST: { type: String, optional: true },
	LOG_LEVEL: { type: String, optional: true },
	NODE_ENV: { type: String, optional: true },
});

const token: string = env.LOGTAIL_SECRET;
const host: string = env.LOGTAIL_HOST;
const level: LevelWithSilent | string = env.LOG_LEVEL ?? 'error';

const targets: TransportTargetOptions[] = [];
let options;
if (host) {
	options = { endpoint: 'https://' + host };
}
if (token) {
	targets.push({
		target: '@logtail/pino',
		options: { sourceToken: token, options },
		level,
	});
} else if (process.env.NODE_ENV === 'development') {
	targets.push({
		target: 'pino-pretty',
		options: { colorize: true, translateTime: 'SYS:HH:MM:ss.l', ignore: 'pid,hostname' },
		level,
	});
} else {
	targets.push({
		target: 'pino/file',
		options: { destination: 1 },
		level,
	});
}

export const logger = pino({
	level,
	transport: {
		targets,
	},
});

export default logger;
