import {rollup, RollupOptions, RollupOutput} from "rollup";
import typescriptRollupPlugin from "rollup-plugin-ts";
import nodeResolve from "@rollup/plugin-node-resolve";
import {cjsToEsm} from "../../src/transformer/cjs-to-esm";
import {TestFile} from "./test-file";
import {TestContext} from "./test-context";
import {createTestSetup} from "./test-setup";
import {MaybeArray, PartialExcept} from "helpertypes";
import path from "crosspath";

export interface RollupTestContext extends TestContext {
	rollupOptions: Partial<RollupOptions>;
}

/**
 * Prepares a test
 */
export async function executeRollup(inputFiles: MaybeArray<TestFile>, options: PartialExcept<RollupTestContext, "typescript">): Promise<RollupOutput> {
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
		const normalizedFileName = path.normalize(fileName);
		const normalizedParent = parent == null ? undefined : path.normalize(parent);
		const absolute = path.isAbsolute(normalizedFileName) ? normalizedFileName : path.join(normalizedParent == null ? "" : path.dirname(normalizedParent), normalizedFileName);
		for (const ext of ["", ".ts", ".js", ".mjs"]) {
			const withExtension = `${absolute}${ext}`;
			const matchedFile = files.find(file => path.normalize(file.fileName) === path.normalize(withExtension));
			if (matchedFile != null) return path.native.normalize(withExtension);
		}
		return null;
	};

	const load = (id: string): string | null => {
		const normalized = path.normalize(id);
		const matchedFile = files.find(file => path.normalize(file.fileName) === path.normalize(normalized));
		return matchedFile == null ? null : matchedFile.text;
	};

	const result = await rollup({
		input: path.native.normalize(entry.fileName),
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
