import {sync} from "resolve";
import {dirname, isAbsolute, join} from "path";
import {isExternalLibrary} from "./is-external-library";

export interface ResolveOptions {
	id: string;
	parent: string | null | undefined;
	moduleDirectory?: string;
	prioritizedPackageKeys?: string[];
	prioritizedExtensions?: string[];
	readFile(fileName: string, encoding?: string): string | undefined;
	fileExists(fileName: string): boolean;
}

/**
 * A map between id's and their results from previous resolving
 * @type {Map<string, string|undefined>}
 */
const cache: Map<string, string | null> = new Map();

/**
 * Computes a cache key based on the combination of id and parent
 *
 * @param id
 * @param parent
 * @return
 */
function computeCacheKey(id: string, parent: string | null | undefined): string {
	return isExternalLibrary(id) ? id : `${parent == null ? "" : `${parent}->`}${id}`;
}

/**
 * A function that can resolve an import path
 *
 * @param options
 * @returns
 */
export function resolvePath({
	id,
	parent,
	prioritizedPackageKeys = ["es2015", "esm2015", "module", "jsnext:main", "main", "browser"],
	prioritizedExtensions = ["", ".js", ".mjs", ".jsx", ".ts", ".tsx", ".json"],
	moduleDirectory = "node_modules",
	fileExists,
	readFile
}: ResolveOptions): string | undefined {
	const cacheKey = computeCacheKey(id, parent);

	// Attempt to take the resolve result from the cache
	const cacheResult = cache.get(cacheKey);

	// If it is a proper path, return it
	if (cacheResult != null) return cacheResult;

	// Otherwise, if the cache result isn't strictly equal to 'undefined', it has previously been resolved to a non-existing file
	if (cacheResult === null) return;

	if (!isExternalLibrary(id)) {
		const absolute = isAbsolute(id) ? id : join(parent == null ? "" : dirname(parent), id);
		const variants = [absolute, join(absolute, "index")];
		for (const variant of variants) {
			for (const ext of prioritizedExtensions) {
				const withExtension = `${variant}${ext}`;
				if (fileExists(withExtension)) {
					// Add it to the cache
					cache.set(cacheKey, withExtension);
					return withExtension;
				}
			}
		}

		// Add it to the cache and mark it as unresolvable
		cache.set(cacheKey, null);
		return undefined;
	}

	// Otherwise, try to resolve it via node module resolution and put it in the cache
	try {
		const resolveResult = sync(id, {
			extensions: prioritizedExtensions,
			moduleDirectory,
			readFileSync: (file, charset) => readFile(file, charset)!,
			isFile: file => fileExists(file),
			packageFilter(pkg: Record<string, string>): Record<string, string> {
				let property: string | undefined | null | void;

				//  Otherwise, or if no key was selected, use the prioritized list of fields and take the first matched one
				if (property == null) {
					const packageKeys = Object.keys(pkg);
					property = prioritizedPackageKeys.find(key => packageKeys.includes(key));
				}

				// If a property was resolved, set the 'main' property to it (resolve will use the main property no matter what)
				if (property != null) {
					pkg.main = pkg[property];
				}

				// Return the package
				return pkg;
			}
		});

		// Add it to the cache
		cache.set(cacheKey, resolveResult);

		// Return it
		return resolveResult;
	} catch (ex) {
		// No file could be resolved. Set it in the cache as unresolvable and return void
		cache.set(cacheKey, null);

		// Return undefined¬
		return undefined;
	}
}
