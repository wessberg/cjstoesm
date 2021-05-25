import {TransformedFile} from "../../src/shared/task/transform-result";
import {nativeJoin, nativeRelative} from "../../src/transformer/util/path-util";
import {TestFileDirectories} from "./test-file";

export interface TestResult {
	files: TransformedFile[];
	findFile: (fileName: string) => TransformedFile | undefined;
}

export function createTestResult(dir: TestFileDirectories, files: TransformedFile[] = []): TestResult {
	const findFile = (fileName: string): TransformedFile | undefined => {
		const distFile = nativeJoin(dir.dist, nativeRelative(dir.root, nativeJoin(dir.src, fileName)));
		return files.find(file => file.fileName === fileName || file.fileName === distFile);
	};

	return {
		files,
		findFile
	};
}
