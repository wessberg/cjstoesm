import {TransformedFile} from "../../src/shared/task/transform-result.js";
import {TestFileDirectories} from "./test-file.js";
import path from "crosspath";
import { rewriteFilenamePath } from "../../src/shared/util/util.js";

export interface TestResult {
	files: TransformedFile[];
	findFile: (fileName: string) => TransformedFile | undefined;
}

export function createTestResult(dir: TestFileDirectories, files: TransformedFile[] = []): TestResult {
	const findFile = (fileName: string): TransformedFile | undefined => {
		const distFile = rewriteFilenamePath(dir.root, fileName, dir.dist);
		return files.find(file => path.normalize(file.fileName) === path.normalize(fileName) || path.normalize(file.fileName) === distFile);
	};

	return {
		files,
		findFile
	};
}
