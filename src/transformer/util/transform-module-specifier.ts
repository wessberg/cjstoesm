import {dirname, ensureHasLeadingDotAndPosix, extname, isExternalLibrary, relative, setExtension} from "./path-util";
import {VisitorContext} from "../visitor-context";

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
		case ".js":
		case ".jsx":
			return ".js";
		case ".mjs":
		case ".mjsx":
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
	if (extname(moduleSpecifier) !== "" || resolvedModuleSpecifier == null) {
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

	return setExtension(ensureHasLeadingDotAndPosix(relative(dirname(parent), resolvedModuleSpecifier)), determineNewExtension(extname(resolvedModuleSpecifier)));
}
