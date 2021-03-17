import {rollup, RollupOptions, RollupOutput} from "rollup";
import typescriptRollupPlugin from "@wessberg/rollup-plugin-ts";
import nodeResolve from "@rollup/plugin-node-resolve";
import {cjsToEsm} from "../../src/transformer/cjs-to-esm";
import {existsSync, readFileSync, statSync} from "fs";
import {isInDebugMode} from "../util/is-in-debug-mode";
import {CjsToEsmOptions} from "../../src/transformer/cjs-to-esm-options";
import {TS} from "../../src/type/ts";
import * as TSModule from "typescript";
import {dirname, isAbsolute, join, nativeDirname, nativeJoin, nativeNormalize, normalize} from "../../src/transformer/util/path-util";

// tslint:disable:no-any

export interface ITestFile {
	fileName: string;
	text: string;
	entry: boolean;
}

export type TestFile = ITestFile | string;

export interface GenerateRollupBundleOptions {
	debug: CjsToEsmOptions["debug"];
	preserveModuleSpecifiers: CjsToEsmOptions["preserveModuleSpecifiers"];
	typescript: typeof TS;
	cwd?: string;
}

/**
 * Prepares a test
 */
export async function generateRollupBundle(
	inputFiles: TestFile[] | TestFile,
	rollupOptions: Partial<RollupOptions> = {},
	{debug = isInDebugMode(), preserveModuleSpecifiers = "always", typescript = TSModule, cwd = process.cwd()}: Partial<GenerateRollupBundleOptions> = {}
): Promise<RollupOutput> {
	const files: ITestFile[] = (Array.isArray(inputFiles) ? inputFiles : [inputFiles])
		.map(file =>
			typeof file === "string"
				? {
						text: file,
						fileName: `auto-generated-${Math.floor(Math.random() * 100000)}.ts`,
						entry: true
				  }
				: file
		)
		.map(file => ({...file, fileName: nativeJoin(cwd, file.fileName)}));

	const entryFile = files.find(file => file.entry);
	if (entryFile == null) {
		throw new ReferenceError(`No entry could be found`);
	}

	const resolveId = (fileName: string, parent: string | undefined): string | null => {
		const normalizedFileName = normalize(fileName);
		const normalizedParent = parent == null ? undefined : normalize(parent);
		const absolute = isAbsolute(normalizedFileName) ? normalizedFileName : join(normalizedParent == null ? "" : dirname(normalizedParent), normalizedFileName);
		for (const ext of ["", ".ts", ".js", ".mjs"]) {
			const withExtension = `${absolute}${ext}`;
			const matchedFile = files.find(file => normalize(file.fileName) === normalize(withExtension));
			if (matchedFile != null) return nativeNormalize(withExtension);
		}
		return null;
	};

	const load = (id: string): string | null => {
		const normalized = normalize(id);
		const matchedFile = files.find(file => normalize(file.fileName) === normalize(normalized));
		return matchedFile == null ? null : matchedFile.text;
	};

	const result = await rollup({
		input: nativeNormalize(entryFile.fileName),
		external: () => true,
		...rollupOptions,
		plugins: [
			{
				name: "VirtualFileResolver",
				resolveId,
				load
			},
			typescriptRollupPlugin({
				tsconfig: {
					target: "esnext",
					allowJs: true
				},
				typescript,
				transformers: [
					cjsToEsm({
						debug,
						preserveModuleSpecifiers,
						typescript,
						fileSystem: {
							readFile: fileName => {
								const file = files.find(currentFile => normalize(currentFile.fileName) === normalize(fileName));
								if (file != null) return file.text;
								else if (existsSync(nativeNormalize(fileName))) {
									return readFileSync(nativeNormalize(fileName), "utf8");
								} else return undefined;
							},
							fileExists: fileName => {
								if (files.some(file => normalize(file.fileName) === normalize(fileName))) return true;
								return existsSync(nativeNormalize(fileName)) && !statSync(nativeNormalize(fileName)).isDirectory();
							},
							directoryExists: dir => {
								const normalized = nativeNormalize(dir);
								return (
									files.some(file => nativeDirname(file.fileName) === normalized || nativeDirname(file.fileName).startsWith(nativeNormalize(`${normalized}/`))) ||
									(existsSync(nativeNormalize(dir)) && statSync(nativeNormalize(dir)).isDirectory())
								);
							}
						}
					})
				],
				transpileOnly: true
			}),
			nodeResolve(),
			...(rollupOptions.plugins == null ? [] : rollupOptions.plugins)
		]
	});
	return await result.generate({
		format: "esm",
		sourcemap: true
	});
}
