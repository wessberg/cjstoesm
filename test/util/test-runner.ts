import path from "crosspath";
import fs from "node:fs";
import semver from "semver";
import testModule, {type TestContext} from "node:test";
import type * as TS from "typescript";

function getNearestPackageJson(from = import.meta.url): Record<string, unknown> | undefined {
	// There may be a file protocol in from of the path
	const normalizedFrom = path.urlToFilename(from);
	const currentDir = path.dirname(normalizedFrom);

	const pkgPath = path.join(currentDir, "package.json");
	if (fs.existsSync(pkgPath)) {
		return JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as Record<string, unknown>;
	} else if (currentDir !== normalizedFrom) {
		return getNearestPackageJson(currentDir);
	} else {
		return undefined;
	}
}

const pkg = getNearestPackageJson();

export interface ExecutionContextOptions {
	typescript: typeof TS;
	typescriptModuleSpecifier: string;
}

export type ExtendedImplementation = (t: TestContext, options: ExecutionContextOptions) => void | Promise<void>;

const {devDependencies} = pkg as {devDependencies: Record<string, string>};

// Set of all TypeScript versions parsed from package.json
const availableTsVersions = new Set<string>();
const TS_OPTIONS_RECORDS = new Map<string, ExecutionContextOptions>();

const tsRangeRegex = /(npm:typescript@)?[\^~]*(.+)$/;
const filter = process.env.TS_VERSION;

for (const [specifier, range] of Object.entries(devDependencies)) {
	const match = range.match(tsRangeRegex);
	if (match !== null) {
		const [, context, version] = match;
		if (version != null && (context === "npm:typescript@" || specifier === "typescript")) {
			availableTsVersions.add(version);
			if (filter === undefined || (filter.toUpperCase() === "CURRENT" && specifier === "typescript") || semver.satisfies(version, filter, {includePrerelease: true})) {
				const typescript = ((await import(specifier)) as {default: typeof TS}).default;
				TS_OPTIONS_RECORDS.set(version, {
					typescript,
					typescriptModuleSpecifier: specifier
				});
			}
		}
	}
}

if (availableTsVersions.size === 0) {
	throw new Error(`The TS_VERSION environment variable matches none of the available TypeScript versions.
Filter: ${process.env.TS_VERSION}
Available TypeScript versions: ${[...availableTsVersions].join(", ")}`);
}

interface TestRunOptions {
	only: boolean;
}

export function test(title: string, tsVersionGlob: string | undefined, impl: ExtendedImplementation, runOptions?: Partial<TestRunOptions>): void {
	const allOptions =
		tsVersionGlob == null || tsVersionGlob === "*"
			? [...TS_OPTIONS_RECORDS.values()]
			: [...TS_OPTIONS_RECORDS.entries()].filter(([version]) => semver.satisfies(version, tsVersionGlob, {includePrerelease: true})).map(([, options]) => options);

	for (const currentOptions of allOptions) {
		const fullTitle = `${title} (TypeScript v${currentOptions.typescript.version})`;

		if (Boolean(runOptions?.only)) {
			testModule(fullTitle, {only: true}, async t => impl(t, currentOptions));
		} else {
			testModule(fullTitle, async t => impl(t, currentOptions));
		}
	}
}
