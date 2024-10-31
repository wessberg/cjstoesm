import {cjsToEsm} from "../../src/transformer/cjs-to-esm.js";
import type {TS} from "../../src/type/ts.js";
import type {TestResult} from "./test-result.js";
import {createTestResult} from "./test-result.js";
import type {TestFile} from "./test-file.js";
import type {TestContext} from "./test-context.js";
import {createTestSetup} from "./test-setup.js";
import type {MaybeArray, PartialExcept} from "helpertypes";
import path from "crosspath";

/**
 * Prepares a test
 */
export function executeTransformer(inputFiles: MaybeArray<TestFile>, options: PartialExcept<TestContext, "typescript">): TestResult {
	const {
		context,
		fileStructure: {files, dir},
		fileSystem,
		compilerHost
	} = createTestSetup(inputFiles, options);
	const result = createTestResult(dir);

	const {typescript} = context;

	const transformers = cjsToEsm({...context, cwd: dir.root, fileSystem});

	const compilerOptions: TS.CompilerOptions = {
		target: typescript.ScriptTarget.ESNext,
		allowJs: true,
		sourceMap: false,
		outDir: dir.dist,
		rootDir: dir.root,
		module: typescript.ModuleKind.ESNext,
		// eslint-disable-next-line @typescript-eslint/no-deprecated, @typescript-eslint/naming-convention
		moduleResolution: (typescript.ModuleResolutionKind as {Bundler?: TS.ModuleResolutionKind}).Bundler ?? typescript.ModuleResolutionKind.NodeJs
	};

	const program = typescript.createProgram({
		rootNames: files.map(file => path.normalize(file.fileName)),
		options: compilerOptions,
		host: compilerHost
	});

	program.emit(
		undefined,
		(fileName, text) => {
			result.files.push({fileName, text});
		},
		undefined,
		undefined,
		transformers
	);

	return result;
}
