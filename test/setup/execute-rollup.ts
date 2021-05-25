import {rollup, RollupOptions, RollupOutput} from "rollup";
import typescriptRollupPlugin from "@wessberg/rollup-plugin-ts";
import nodeResolve from "@rollup/plugin-node-resolve";
import {cjsToEsm} from "../../src/transformer/cjs-to-esm";
import {dirname, isAbsolute, join, nativeNormalize, normalize} from "../../src/transformer/util/path-util";
import {MaybeArray} from "../../src/type/type-util";
import {TestFile} from "./test-file";
import {TestContext} from "./test-context";
import {createTestSetup} from "./test-setup";

export interface RollupTestContext extends TestContext {
	rollupOptions: Partial<RollupOptions>;
}

/**
 * Prepares a test
 */
export async function executeRollup(inputFiles: MaybeArray<TestFile>, options: Partial<RollupTestContext> = {}): Promise<RollupOutput> {
	const {
		context,
		fileStructure: {files, entry},
		fileSystem
	} = createTestSetup(inputFiles, {preserveModuleSpecifiers: "always", ...options});
	const {typescript} = context;
	const {rollupOptions = {}} = options;

	if (entry == null) {
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
		input: nativeNormalize(entry.fileName),
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
						...context,
						fileSystem
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
