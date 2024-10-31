import type {IsRequireCallResult} from "./is-require-call.js";
import type {ModuleExports} from "../module-exports/module-exports.js";
import {BUILT_IN_MODULE_MAP, isBuiltInModule} from "../built-in/built-in-module-map.js";
import type {BeforeVisitorContext} from "../visitor/before-visitor-context.js";
import {isJsonModule} from "./path-util.js";

/**
 * Tries to get or potentially parse module exports based on the given data in the given context
 */
export function getModuleExportsFromRequireDataInContext(data: IsRequireCallResult, context: BeforeVisitorContext): ModuleExports | undefined {
	if (!data.match) return undefined;

	const {typescript} = context;

	// Otherwise, spread out the things we know about the require call
	const {moduleSpecifier, resolvedModuleSpecifierText, resolvedModuleSpecifier} = data;

	// If no module specifier could be determined, remove the CallExpression from the SourceFile
	if (moduleSpecifier == null) {
		return undefined;
	}

	// If we've been able to resolve a module as well as its contents,
	// Check it for exports so that we know more about its internals, for example whether or not it has any named exports, etc
	let moduleExports: ModuleExports | undefined;

	// If no module specifier could be resolved, it may be a built in module - an we may know about its module exports already
	if (resolvedModuleSpecifier == null && isBuiltInModule(moduleSpecifier)) {
		moduleExports = BUILT_IN_MODULE_MAP[moduleSpecifier];
	}

	// Otherwise, if we could resolve a module, try to get the exports for it
	else if (resolvedModuleSpecifier != null) {
		// Treat JSON modules as ones with a single default export
		if (isJsonModule(resolvedModuleSpecifier)) {
			moduleExports = {
				withValue: "json",
				hasDefaultExport: true,
				namedExports: new Set()
			};
		} else {
			// Try to get the ModuleExports for the resolved module, if we know them already
			moduleExports = context.getModuleExportsForPath(resolvedModuleSpecifier);

			// If that wasn't possible, generate a new SourceFile and parse it
			if (moduleExports == null) {
				moduleExports = context.transformSourceFile(
					typescript.createSourceFile(resolvedModuleSpecifier, resolvedModuleSpecifierText, typescript.ScriptTarget.ESNext, true, typescript.ScriptKind.TS),
					{
						...context,
						onlyExports: true
					}
				).exports;
			}
		}
	}
	return moduleExports;
}
