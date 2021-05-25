export interface RandomPathOptions {
	extension: string;
	prefix: string;
	suffix: string;
}
export function generateRandomPath({extension = "", prefix = "__#auto-generated-", suffix = String(Math.floor(Math.random() * 100000))}: Partial<RandomPathOptions> = {}) {
	return `${prefix}${suffix}${extension}`;
}

/**
 * Ensures that the given item is in fact an array
 */
export function ensureArray<T>(item: T | T[]): T[] {
	return Array.isArray(item) ? item : [item];
}
