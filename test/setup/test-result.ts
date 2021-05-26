import {TransformedFile} from "../../src/shared/task/transform-result";
import {TestFileDirectories} from "./test-file";
import path from "crosspath";

export interface TestResult {
	files: TransformedFile[];
	findFile: (fileName: string) => TransformedFile | undefined;
}

export function createTestResult(dir: TestFileDirectories, files: TransformedFile[] = []): TestResult {
	const findFile = (fileName: string): TransformedFile | undefined => {
		const distFile = path.join(dir.dist, path.relative(dir.root, path.join(dir.src, fileName)));
		return files.find(file => path.normalize(file.fileName) === path.normalize(fileName) || path.normalize(file.fileName) === distFile);
	};

	return {
		files,
		findFile
	};
}
