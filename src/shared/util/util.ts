import path from "crosspath";
import fs from "fs";
import {IgnoredLookupValue} from "helpertypes";
export interface RandomPathOptions {
	extension: string;
	prefix: string;
	suffix: string;
}
export function generateRandomPath({extension = "", prefix = "__#auto-generated-", suffix = String(Math.floor(Math.random() * 100000))}: Partial<RandomPathOptions> = {}) {
	return `${prefix}${suffix}${extension}`;
}

export function getNearestPackageJson(from = import.meta.url): Record<string, unknown> | undefined {
	// There may be a file protocol in from of the path
	const normalizedFrom = from.replace(/file:\/{2,3}/, "");
	const currentDir = path.dirname(normalizedFrom);

	const pkgPath = path.join(currentDir, "package.json");
	if (fs.existsSync(pkgPath)) {
		return JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
	} else if (currentDir !== normalizedFrom) {
		return getNearestPackageJson(currentDir);
	} else {
		return undefined;
	}
}

/**
 * Ensures that the given item is in fact an array
 */
export function ensureArray<T>(item: T | T[]): T[] {
	return Array.isArray(item) ? item : [item];
}

export function getFolderClosestToRoot(root: string, files: Iterable<string>): string {
	const [head] = files;
	if (head == null) {
		throw new ReferenceError(`At least 1 file must be provided`);
	}
	let candidate = head;

	for (const file of files) {
		const relativeToRoot = path.relative(root, file);
		if (relativeToRoot.split("/").length < candidate.split("/").length) {
			candidate = relativeToRoot;
		}
	}

	return path.join(root, path.dirname(candidate));
}

export function rewriteFilenamePath(root: string, filename: string, outDir?: string | undefined) {
	if (outDir == null) return path.normalize(filename);
	const {dir, base} = path.parse(filename);

	let relativeDirFromSrc = dir === "" ? path.join(path.relative(root, dir)) : path.join(path.relative(root, dir), "../");

	if (relativeDirFromSrc.startsWith("/")) {
		relativeDirFromSrc = relativeDirFromSrc.slice(1);
	}
	if (relativeDirFromSrc.startsWith("./")) {
		relativeDirFromSrc = relativeDirFromSrc.slice(2);
	}
	if (relativeDirFromSrc.includes("/")) {
		relativeDirFromSrc = relativeDirFromSrc.slice(relativeDirFromSrc.indexOf("/") + 1);
	} else {
		relativeDirFromSrc = ``;
	}
	return path.join(outDir, relativeDirFromSrc, base);
}

export function normalizeGlob(glob: string): string {
	return path.extname(glob) === "" && !glob.endsWith("*") ? `${glob}/*` : glob;
}

export function isRecord<T>(value: T): value is Exclude<T, IgnoredLookupValue | unknown[]> & Record<string, unknown> {
	return (
		!Array.isArray(value) &&
		typeof value === "object" &&
		value != null &&
		!(value instanceof Date) &&
		!(value instanceof Set) &&
		!(value instanceof WeakSet) &&
		!(value instanceof Map) &&
		!(value instanceof WeakMap)
	);
}
