import Module from "module";
import path from "crosspath";
import {existsSync, mkdirSync, writeFileSync} from "fs";
import {format, type RequiredOptions} from "prettier";
import prettierConfig from "@wessberg/prettier-config" assert {type: "json"};

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

async function generateBuiltInModule(): Promise<string> {
	return format(
		`\
/* eslint-disable */
/**
 * @file This file is auto-generated. Do not change its contents.
 */

import {ElementOf} from "helpertypes";
import {ModuleExports} from "../module-exports/module-exports.js";

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
	${await generateBuiltInModuleMapInnerContents()}
};
`,
		{
			...(prettierConfig as Partial<RequiredOptions>),
			parser: "typescript"
		}
	);
}

async function generateBuiltInModuleMapInnerContents(): Promise<string> {
	let str = "";
	for (const moduleName of Module.builtinModules) {
		if (IGNORED_MODULE_NAMES.has(moduleName)) continue;
		str += `${await generateBuiltInModuleMapContents(moduleName)},\n`;
	}
	return str;
}

function filterAndFormatModuleKeys(keys: string[]): string {
	const filteredKeys = keys.filter(key => !key.startsWith("_"));
	return `[${filteredKeys.map(filteredKey => `"${filteredKey}"`).join(",")}]`;
}

async function generateBuiltInModuleMapContents(moduleName: string): Promise<string> {
	let loadedModule = await import(moduleName);
	loadedModule ="default" in loadedModule ? loadedModule.default : loadedModule;

	return `\
		${moduleName.includes("/") ? `"${moduleName}"` : moduleName}: {
			namedExports: new Set(${typeof loadedModule === "function" ? "[]" : filterAndFormatModuleKeys(Object.keys(loadedModule))}),
			hasDefaultExport: true
		}`;
}

const CURRENT_DIR = path.dirname(import.meta.url.replace(/file:\/{2,3}/, ``));
const DESTINATION_DIR = path.join(CURRENT_DIR, "../src/transformer/built-in");
const DESTINATION = path.join(DESTINATION_DIR, "built-in-module-map.ts");

if (!existsSync(path.native.normalize(DESTINATION_DIR))) {
	mkdirSync(path.native.normalize(DESTINATION_DIR));
}

writeFileSync(path.native.normalize(DESTINATION), await generateBuiltInModule());