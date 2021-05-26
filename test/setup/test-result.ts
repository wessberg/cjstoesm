import {TransformedFile} from "../../src/shared/task/transform-result";
import {join, normalize, relative} from "../../src/transformer/util/path-util";
import {TestFileDirectories} from "./test-file";

export interface TestResult {
	files: TransformedFile[];
	findFile: (fileName: string) => TransformedFile | undefined;
}

export function createTestResult(dir: TestFileDirectories, files: TransformedFile[] = []): TestResult {
	const findFile = (fileName: string): TransformedFile | undefined => {
		const distFile = join(dir.dist, relative(dir.root, join(dir.src, fileName)));
		return files.find(file => normalize(file.fileName) === normalize(fileName) || normalize(file.fileName) === distFile);
	};

	return {
		files,
		findFile
	};
}
