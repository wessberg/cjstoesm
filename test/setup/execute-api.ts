import {TestFile} from "./test-file";
import {TestContext} from "./test-context";
import {createTestSetup} from "./test-setup";
import {transform} from "../../src/api/transform";
import {createTestResult, TestResult} from "./test-result";
import {MaybeArray} from "helpertypes";

/**
 * Prepares a test via the transform function
 */
export async function executeApi(inputFiles: MaybeArray<TestFile>, options?: Partial<TestContext>): Promise<TestResult> {
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
