type TYear = `${number}${number}${number}${number}`;
type TMonth = `${number}${number}`;
type TDay = `${number}${number}`;
type THours = `${number}${number}`;
type TMinutes = `${number}${number}`;
type TSeconds = `${number}${number}`;
type TMilliseconds = `${number}${number}${number}`;

/**
 * Represent a string like `2021-01-08`
 */
type TDateISODate = `${TYear}-${TMonth}-${TDay}`;

/**
 * Represent a string like `14:42:34.678` or `14:42:34`
 */
type TDateISOTime =
	| `${THours}:${TMinutes}:${TSeconds}.${TMilliseconds}`
	| `${THours}:${TMinutes}:${TSeconds}`;

/**
 * Represent a string like `2021-01-08T14:42:34.678Z` or `2021-01-08T14:42:34Z` (format: ISO 8601).
 */
export type TypeDateISO =
	| `${TDateISODate}T${TDateISOTime}Z`
	| `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`
	| `${number}-${number}-${number}T${number}:${number}:${number}Z`;
