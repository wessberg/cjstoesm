import {sync} from "resolve";
import {dirname, isAbsolute, isExternalLibrary, join, normalize} from "./path-util";
import {SafeReadonlyFileSystem} from "../../shared/file-system/file-system";

export interface ResolveOptions {
	cwd: string;
	id: string;
	parent: string | null | undefined;
	moduleDirectory?: string;
	prioritizedPackageKeys?: string[];
	prioritizedExtensions?: string[];
	resolveCache: Map<string, string | null>;
	fileSystem: SafeReadonlyFileSystem;
}

/**
 * Computes a cache key based on the combination of id and parent
 */
function computeCacheKey(id: string, parent: string | null | undefined): string {
	return isExternalLibrary(id) ? id : `${parent == null ? "" : `${parent}->`}${id}`;
}

/**
 * A function that can resolve an import path
 */
export function resolvePath({
	id,
	parent,
	cwd,
	prioritizedPackageKeys = ["es2015", "esm2015", "module", "jsnext:main", "main", "browser"],
	prioritizedExtensions = ["", ".js", ".mjs", ".jsx", ".ts", ".tsx", ".json"],
	moduleDirectory = "node_modules",
	fileSystem,
	resolveCache
}: ResolveOptions): string | undefined {
	id = normalize(id);
	if (parent != null) {
		parent = normalize(parent);
	}

	const cacheKey = computeCacheKey(id, parent);

	// Attempt to take the resolve result from the cache
	const cacheResult = resolveCache.get(cacheKey);

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
				if (fileSystem.safeStatSync(withExtension)?.isFile() ?? false) {
					// Add it to the cache
					resolveCache.set(cacheKey, withExtension);
					return withExtension;
				}
			}
		}

		// Add it to the cache and mark it as unresolvable
		resolveCache.set(cacheKey, null);
		return undefined;
	}

	// Otherwise, try to resolve it via node module resolution and put it in the cache
	try {
		const resolveResult = normalize(
			sync(id, {
				basedir: normalize(cwd),
				extensions: prioritizedExtensions,
				moduleDirectory: moduleDirectory,
				readFileSync: path => fileSystem.readFileSync(path).toString(),
				isFile: path => fileSystem.safeStatSync(path)?.isFile() ?? false,
				isDirectory: path => fileSystem.safeStatSync(path)?.isDirectory() ?? false,
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
			})
		);

		// Add it to the cache
		resolveCache.set(cacheKey, resolveResult);

		// Return it
		return resolveResult;
	} catch (ex) {
		// No file could be resolved. Set it in the cache as unresolvable and return void
		resolveCache.set(cacheKey, null);

		// Return undefined¬
		return undefined;
	}
}
