import type {TestContext} from "./test-context.js";
import {createTestContext} from "./test-context.js";
import type {FileSystem} from "../../src/shared/file-system/file-system.js";
import type {TestFile, TestFileStructure} from "./test-file.js";
import {createTestFileStructure} from "./test-file.js";
import {createVirtualFileSystem} from "./create-virtual-file-system.js";
import type {TS} from "../../src/type/ts.js";
import {createCompilerHost} from "../../src/shared/compiler-host/create-compiler-host.js";
import type {MaybeArray, PartialExcept} from "helpertypes";

export interface TestSetup {
	context: TestContext;
	fileSystem: FileSystem;
	fileStructure: TestFileStructure;
	compilerHost: TS.CompilerHost;
}

export function createTestSetup(inputFiles: MaybeArray<TestFile>, options: PartialExcept<TestContext, "typescript">): TestSetup {
	const context = createTestContext(options);
	const fileStructure = createTestFileStructure(inputFiles, context);
	const fileSystem = createVirtualFileSystem(fileStructure.files);
	const compilerHost = createCompilerHost({
		fileSystem,
		typescript: context.typescript,
		cwd: fileStructure.dir.root
	});
	return {
		context,
		fileStructure,
		fileSystem,
		compilerHost
	};
}
