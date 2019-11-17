import Module from "module";
import {join} from "path";
import {existsSync, mkdirSync, writeFileSync} from "fs";
import {format} from "prettier";
// @ts-ignore
import prettierConfig from "../prettier.config.js";

const IGNORED_MODULE_NAMES = new Set([
	"_http_agent",
	"_http_client",
	"_http_common",
	"_http_incoming",
	"_http_outgoing",
	"_http_server",
	"_stream_duplex",
	"_stream_passthrough",
	"_stream_readable",
	"_stream_transform",
	"_stream_wrap",
	"_stream_writable",
	"_tls_common",
	"_tls_wrap",
	"v8/tools/SourceMap",
	"v8/tools/arguments",
	"v8/tools/codemap",
	"v8/tools/consarray",
	"v8/tools/csvparser",
	"v8/tools/logreader",
	"v8/tools/profile",
	"v8/tools/profile_view",
	"v8/tools/splaytree",
	"v8/tools/tickprocessor",
	"v8/tools/tickprocessor-driver",
	"node-inspect/lib/_inspect",
	"node-inspect/lib/internal/inspect_client",
	"node-inspect/lib/internal/inspect_repl",
	"sys"
]);

function generateBuiltInModuleInnerContents(): string {
	let str = "";
	for (const moduleName of Module.builtinModules) {
		if (IGNORED_MODULE_NAMES.has(moduleName)) continue;
		str += `"${moduleName}",\n`;
	}
	return str;
}

function generateBuiltInModule(): string {
	return format(
		`\
/**
 * @file This file is auto-generated. Do not change its contents.
 */

import {ElementOf} from "../util/element-of";
import {ModuleExports} from "../module-exports/module-exports";

export const BUILT_IN_MODULE = new Set([
	${generateBuiltInModuleInnerContents()}
] as const);

export type BuiltInModule = ElementOf<typeof BUILT_IN_MODULE>;
export type BuiltInModuleMap = {
	[Key in BuiltInModule]: ModuleExports;
}

export function isBuiltInModule (moduleName: string): moduleName is BuiltInModule {
	return BUILT_IN_MODULE.has(moduleName as BuiltInModule);
}
	
export const BUILT_IN_MODULE_MAP: BuiltInModuleMap = {
	${generateBuiltInModuleMapInnerContents()}
};
`,
		{
			...prettierConfig,
			parser: "typescript"
		}
	);
}

function generateBuiltInModuleMapInnerContents(): string {
	let str = "";
	for (const moduleName of Module.builtinModules) {
		if (IGNORED_MODULE_NAMES.has(moduleName)) continue;
		str += `${generateBuiltInModuleMapContents(moduleName)},\n`;
	}
	return str;
}

function filterAndFormatModuleKeys(keys: string[]): string {
	const filteredKeys = keys.filter(key => !key.startsWith("_"));
	return `[${filteredKeys.map(filteredKey => `"${filteredKey}"`).join(",")}]`;
}

function generateBuiltInModuleMapContents(moduleName: string): string {
	const loadedModule = /* tslint:disable:no-var-requires */ require(moduleName); /* tslint:enable:no-var-requires */
	return `\
		${moduleName}: {
			namedExports: new Set(${typeof loadedModule === "function" ? "[]" : filterAndFormatModuleKeys(Object.keys(loadedModule))}),
			hasDefaultExport: true
		}`;
}

const DESTINATION_DIR = join(__dirname, "../src/transformer/built-in");
const DESTINATION = join(DESTINATION_DIR, "built-in-module-map.ts");

if (!existsSync(DESTINATION_DIR)) {
	mkdirSync(DESTINATION_DIR);
}

writeFileSync(DESTINATION, generateBuiltInModule());
