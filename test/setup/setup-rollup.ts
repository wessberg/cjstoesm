import {dirname, isAbsolute, join} from "path";
import {rollup, RollupOptions, RollupOutput} from "rollup";
import ts from "@wessberg/rollup-plugin-ts";
import resolve from "rollup-plugin-node-resolve";
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

	const resolveId = (fileName: string, parent: string | null): string | undefined => {
		const absolute = isAbsolute(fileName) ? fileName : join(parent == null ? "" : dirname(parent), fileName);
		for (const ext of ["", ".ts", ".js", ".mjs"]) {
			const withExtension = `${absolute}${ext}`;
			const matchedFile = files.find(file => file.fileName === withExtension);
			if (matchedFile != null) return withExtension;
		}
		return undefined;
	};

	const load = (id: string): string | null => {
		const matchedFile = files.find(file => file.fileName === id);
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
			ts({
				tsconfig: {
					target: "esnext",
					allowJs: true
				},
				transformers: [
					cjsToEsm({
						debug: isInDebugMode(),
						readFile: fileName => {
							const file = files.find(currentFile => currentFile.fileName === fileName);
							if (file != null) return file.text;
							else if (existsSync(fileName)) {
								return readFileSync(fileName, "utf8");
							} else return undefined;
						},
						fileExists: fileName => {
							if (files.some(file => file.fileName === fileName)) return true;
							return existsSync(fileName) && !statSync(fileName).isDirectory();
						}
					})
				],
				transpileOnly: true
			}),
			resolve(),
			...(rollupOptions.plugins == null ? [] : rollupOptions.plugins)
		]
	});
	return await result.generate({
		format: "esm",
		sourcemap: true
	});
}
