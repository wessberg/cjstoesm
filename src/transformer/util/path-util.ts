import {normalize} from "crosspath";

export const KNOWN_EXTENSIONS = [".d.ts", ".d.dts.map", ".js.map", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".mjsx", ".json", ".tsbuildinfo"] as const;

/**
 * Ensure that the given path has a leading "."
 */
export function ensureHasLeadingDotAndPosix(p: string): string {
	const posixPath = normalize(p);
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
 * Returns true if the given path represents an external library
 */
export function isExternalLibrary(p: string): boolean {
	return !p.startsWith(".") && !p.startsWith("/");
}
