import semver from "semver";
import fs from "fs";
import path from "crosspath";
import type {ExecutionContext, OneOrMoreMacros, Macro} from "ava";
import type {TS} from "../../src/type/ts.js";

const currentFile = import.meta.url.replace(/file:\/{2,3}/, "");
const currentDir = path.dirname(currentFile);
const pkg = JSON.parse(fs.readFileSync(path.join(currentDir, "../../package.json"), "utf-8"));

// ava macros
export interface ExtendedImplementationArgumentOptions {
	typescript: typeof TS;
	typescriptModuleSpecifier: string;
}
export type ExtendedImplementation = (t: ExecutionContext, options: ExtendedImplementationArgumentOptions) => void | Promise<void>;
function makeTypeScriptMacro(version: string, specifier: string) {
	const macro: Macro<[ExtendedImplementation]> = async (t, impl) => {
		const typescript = await import(specifier);
		return impl(t, {typescript: "default" in typescript ? typescript.default : typescript, typescriptModuleSpecifier: specifier});
	};
	macro.title = (provided = "") => `${provided} (TypeScript v${version})`;

	return macro;
}
const noMatchingVersionMacro: Macro<[ExtendedImplementation]> = t => {
	t.pass("No matching TypeScript versions");
};
noMatchingVersionMacro.title = (provided = "") => `${provided} (No matching TypeScript versions)`;

const {devDependencies} = pkg as {devDependencies: Record<string, string>};

// Set of all TypeScript versions parsed from package.json
const availableTsVersions = new Set<string>();
// Map of TypeScript version to ava macro
const macros = new Map<string, Macro<[ExtendedImplementation]>>();

const tsRangeRegex = /(npm:typescript@)?[\^~]*(.+)$/;
const filter = process.env.TS_VERSION;

for (const [specifier, range] of Object.entries(devDependencies)) {
	const match = range.match(tsRangeRegex);
	if (match !== null) {
		const [, context, version] = match;
		if (context === "npm:typescript@" || specifier === "typescript") {
			availableTsVersions.add(version);
			if (filter === undefined || (filter.toUpperCase() === "CURRENT" && specifier === "typescript") || semver.satisfies(version, filter, {includePrerelease: true})) {
				macros.set(version, makeTypeScriptMacro(version, specifier));
			}
		}
	}
}

if (macros.size === 0) {
	throw new Error(`The TS_VERSION environment variable matches none of the available TypeScript versions.
Filter: ${process.env.TS_VERSION}
Available TypeScript versions: ${[...availableTsVersions].join(", ")}`);
}

export function withTypeScriptVersions(extraFilter: string): OneOrMoreMacros<[ExtendedImplementation], unknown> {
	const filteredMacros = [...macros.entries()].filter(([version]) => semver.satisfies(version, extraFilter, {includePrerelease: true})).map(([, macro]) => macro);

	if (filteredMacros.length === 0) {
		filteredMacros.push(noMatchingVersionMacro);
	}

	return filteredMacros as OneOrMoreMacros<[ExtendedImplementation], unknown>;
}

export const withTypeScript = withTypeScriptVersions("*");
