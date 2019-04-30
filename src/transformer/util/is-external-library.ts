/**
 * Returns true if the given path represents an external library
 * @param {string} path
 * @returns {boolean}
 */
export function isExternalLibrary(path: string): boolean {
	return !path.startsWith(".") && !path.startsWith("/");
}
