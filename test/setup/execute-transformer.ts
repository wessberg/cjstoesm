import {cjsToEsm} from "../../src/transformer/cjs-to-esm";
import {TS} from "../../src/type/ts";
import {normalize} from "../../src/transformer/util/path-util";
import {createTestResult, TestResult} from "./test-result";
import {TestFile} from "./test-file";
import {TestContext} from "./test-context";
import {MaybeArray} from "../../src/type/type-util";
import {createTestSetup} from "./test-setup";

/**
 * Prepares a test
 */
export function executeTransformer(inputFiles: MaybeArray<TestFile>, options?: Partial<TestContext>): TestResult {
	const {
		context,
		fileStructure: {files, dir},
		fileSystem,
		compilerHost
	} = createTestSetup(inputFiles, {preserveModuleSpecifiers: "always", ...options});
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
		rootNames: files.map(file => normalize(file.fileName)),
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
