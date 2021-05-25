import {nativeJoin} from "../../src/transformer/util/path-util";
import {TestContext} from "./test-context";
import {MaybeArray} from "../../src/type/type-util";
import {ensureArray, generateRandomPath} from "../../src/shared/util/util";

export interface TestFileRecord {
	fileName: string;
	text: string;
	entry?: boolean;
}

export type TestFile = TestFileRecord | string;

const VIRTUAL_ROOT = "#root";
const VIRTUAL_SRC = "src";
const VIRTUAL_DIST = "dist";

export interface TestFileDirectories {
	root: string;
	src: string;
	dist: string;
}

export interface TestFileStructure {
	dir: TestFileDirectories;
	files: TestFileRecord[];
	entry?: TestFileRecord;
}

export function createTestFileStructure(input: MaybeArray<TestFile>, context: TestContext): TestFileStructure {
	const root = nativeJoin(context.cwd, VIRTUAL_ROOT);
	const src = nativeJoin(root, VIRTUAL_SRC);
	const dist = nativeJoin(root, VIRTUAL_DIST);
	const files: TestFileRecord[] = ensureArray(input)
		.map(file =>
			typeof file === "string"
				? {
						text: file,
						fileName: generateRandomPath({extension: ".ts"}),
						entry: true
				  }
				: file
		)
		.map(file => ({...file, fileName: nativeJoin(src, file.fileName)}));

	const entry = files.find(file => file.entry);

	return {
		dir: {
			root,
			src,
			dist
		},
		files,
		entry
	};
}
