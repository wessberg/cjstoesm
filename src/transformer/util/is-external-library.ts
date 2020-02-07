/**
 * Returns true if the given path represents an external library
 *
 * @param path
 * @returns
 */
export function isExternalLibrary(path: string): boolean {
	return !path.startsWith(".") && !path.startsWith("/");
}
