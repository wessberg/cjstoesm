import {cjsToEsm} from "../../src/transformer/cjs-to-esm.js";
import {TS} from "../../src/type/ts.js";
import {createTestResult, TestResult} from "./test-result.js";
import {TestFile} from "./test-file.js";
import {TestContext} from "./test-context.js";
import {createTestSetup} from "./test-setup.js";
import {MaybeArray, PartialExcept} from "helpertypes";
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
		module: typescript.ModuleKind.ESNext,
		target: typescript.ScriptTarget.ESNext,
		allowJs: true,
		sourceMap: false,
		outDir: dir.dist,
		rootDir: dir.root,
		moduleResolution: typescript.ModuleResolutionKind.NodeJs
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
