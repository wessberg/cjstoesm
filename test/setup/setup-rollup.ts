import {dirname, isAbsolute, join, normalize} from "path";
import {rollup, RollupOptions, RollupOutput} from "rollup";
import typescriptRollupPlugin from "@wessberg/rollup-plugin-ts";
import nodeResolve from "rollup-plugin-node-resolve";
import {cjsToEsm} from "../../src/transformer/cjs-to-esm";
import {existsSync, readFileSync, statSync} from "fs";
import {isInDebugMode} from "../util/is-in-debug-mode";

// tslint:disable:no-any

export interface ITestFile {
	fileName: string;
	text: string;
	entry: boolean;
}

export type TestFile = ITestFile | string;

/**
 * Prepares a test
 * @param {ITestFile[]|TestFile} inputFiles
 * @param {Partial<RollupOptions>} [rollupOptions]
 * @returns {Promise<RollupOutput>}
 */
export async function generateRollupBundle(inputFiles: TestFile[] | TestFile, rollupOptions: Partial<RollupOptions> = {}): Promise<RollupOutput> {
	const cwd = process.cwd();

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
		.map(file => ({...file, fileName: join(cwd, file.fileName)}));

	const entryFile = files.find(file => file.entry);
	if (entryFile == null) {
		throw new ReferenceError(`No entry could be found`);
	}

	const resolveId = (fileName: string, parent: string | undefined): string | null => {
		const normalizedFileName = normalize(fileName);
		const normalizedParent = parent == null ? undefined : normalize(parent);
		const absolute = isAbsolute(normalizedFileName)
			? normalizedFileName
			: join(normalizedParent == null ? "" : dirname(normalizedParent), normalizedFileName);
		for (const ext of ["", ".ts", ".js", ".mjs"]) {
			const withExtension = `${absolute}${ext}`;
			const matchedFile = files.find(file => file.fileName === withExtension);
			if (matchedFile != null) return withExtension;
		}
		return null;
	};

	const load = (id: string): string | null => {
		const normalized = normalize(id);
		const matchedFile = files.find(file => file.fileName === normalized);
		return matchedFile == null ? null : matchedFile.text;
	};

	const result = await rollup({
		input: entryFile.fileName,
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
				transformers: [
					cjsToEsm({
						debug: isInDebugMode(),
						readFile: fileName => {
							const normalized = normalize(fileName);
							const file = files.find(currentFile => currentFile.fileName === normalized);
							if (file != null) return file.text;
							else if (existsSync(normalized)) {
								return readFileSync(normalized, "utf8");
							} else return undefined;
						},
						fileExists: fileName => {
							const normalized = normalize(fileName);
							if (files.some(file => file.fileName === normalized)) return true;
							return existsSync(normalized) && !statSync(normalized).isDirectory();
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
