import {ensureHasLeadingDotAndPosix, isExternalLibrary, setExtension} from "./path-util.js";
import type {VisitorContext} from "../visitor-context.js";
import path from "crosspath";

export interface TransformModuleSpecifierOptions {
	context: VisitorContext;
	parent: string;
	resolvedModuleSpecifier: string | undefined;
}

function determineNewExtension(currentExtension: string): string {
	switch (currentExtension) {
		case ".ts":
		case ".tsx":
		case ".d.ts":
		case ".d.mts":
		case ".js":
		case ".jsx":
		case ".cjs":
		case ".cjsx":
		case ".cts":
			return ".js";
		case ".mjs":
		case ".mts":
		case ".mjsx":
		case ".d.cts":
			return ".mjs";
		default:
			return currentExtension;
	}
}

/**
 * Converts the given module specifier to one that is supported by target runtime, based on the given context options
 */
export function transformModuleSpecifier(moduleSpecifier: string, {context, parent, resolvedModuleSpecifier}: TransformModuleSpecifierOptions): string {
	// If the module specifier already contains an extension, do nothing else
	if (path.extname(moduleSpecifier) !== "" || resolvedModuleSpecifier == null) {
		return moduleSpecifier;
	}

	switch (context.preserveModuleSpecifiers) {
		case "always":
			return moduleSpecifier;
		case "never":
			break;
		case "external":
			if (isExternalLibrary(moduleSpecifier)) {
				return moduleSpecifier;
			}
			break;
		case "internal":
			if (!isExternalLibrary(moduleSpecifier)) {
				return moduleSpecifier;
			}
			break;
		default:
			if (context.preserveModuleSpecifiers(moduleSpecifier)) {
				return moduleSpecifier;
			}
	}

	return setExtension(ensureHasLeadingDotAndPosix(path.relative(path.dirname(parent), resolvedModuleSpecifier)), determineNewExtension(path.extname(resolvedModuleSpecifier)));
}
