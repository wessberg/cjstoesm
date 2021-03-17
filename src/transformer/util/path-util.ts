import path, {ParsedPath} from "path";
import slash from "slash";
import {ElementOf} from "./element-of";

export const KNOWN_EXTENSIONS = [
	".d.ts",
	".d.dts.map",
	".js.map",
	".ts",
	".tsx",
	".js",
	".jsx",
	".mjs",
	".mjsx",
	".json",
	".tsbuildinfo"
] as const;

export type KnownExtension = ElementOf<typeof KNOWN_EXTENSIONS>;

export function relative (from: string, to: string): string {
	return ensurePosix(nativeRelative(from, to));
}

export function nativeRelative (from: string, to: string): string {
	return path.relative(from, to);
}

export function join (...paths: string[]): string {
	return ensurePosix(path.join(...paths));
}

export function normalize (p: string): string {
	return ensurePosix(p);
}

export function resolve (p: string): string {
	return ensurePosix(path.resolve(p));
}

export function dirname (p: string): string {
	return ensurePosix(path.dirname(p));
}

export function basename (p: string): string {
	return ensurePosix(path.basename(p));
}

export function extname (p: string): string {
	return path.extname(p);
}

export function parse (p: string): ParsedPath {
	const parsedPath = path.parse(p);
	return {
		ext: parsedPath.ext,
		name: normalize(parsedPath.name),
		base: normalize(parsedPath.base),
		dir: normalize(parsedPath.dir),
		root: normalize(parsedPath.root)
	};
}

/**
 * Ensure that the given path has a leading "."
 */
export function ensureHasLeadingDotAndPosix(p: string): string {

	const posixPath = ensurePosix(p);
	if (posixPath.startsWith(".")) return posixPath;
	if (posixPath.startsWith("/")) return `.${posixPath}`;
	return `./${posixPath}`;
}

/**
 * Strips the extension from a file
 */
export function stripKnownExtension(file: string): string {
	let currentExtname: string | undefined;

	for (const extName of KNOWN_EXTENSIONS) {
		if (file.endsWith(extName)) {
			currentExtname = extName;
			break;
		}
	}

	if (currentExtname == null) return file;

	return file.slice(0, file.lastIndexOf(currentExtname));
}

/**
 * Sets the given extension for the given file
 */
export function setExtension(file: string, extension: string): string {
	return normalize(`${stripKnownExtension(file)}${extension}`);
}


/**
 * Ensures that the given path follows posix file names
 */
export function ensurePosix (p: string): string {
	return slash(p);
}

export function nativeNormalize (p: string): string {
	// Converts to either POSIX or native Windows file paths
	return path.normalize(p);
}

export function nativeDirname (p: string): string {
	return path.dirname(p);
}

export function nativeJoin (...paths: string[]): string {
	return path.join(...paths);
}

export function isAbsolute (p: string): boolean {
	return path.isAbsolute(p);
}

/**
 * Returns true if the given path represents an external library
 */
export function isExternalLibrary (p: string): boolean {
	return (!p.startsWith(".") && !p.startsWith("/"));
}