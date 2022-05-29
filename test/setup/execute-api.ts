import {TestFile} from "./test-file.js";
import {TestContext} from "./test-context.js";
import {createTestSetup} from "./test-setup.js";
import {transform} from "../../src/api/transform.js";
import {createTestResult, TestResult} from "./test-result.js";
import {MaybeArray, PartialExcept} from "helpertypes";

/**
 * Prepares a test via the transform function
 */
export async function executeApi(inputFiles: MaybeArray<TestFile>, options: PartialExcept<TestContext, "typescript">): Promise<TestResult> {
	const {
		context,
		fileStructure: {files, dir},
		fileSystem
	} = createTestSetup(inputFiles, options);

	const result = await transform({
		...context,
		fileSystem,
		cwd: dir.root,
		input: files.map(f => f.fileName),
		outDir: dir.dist
	});

	return createTestResult(dir, result.files);
}
