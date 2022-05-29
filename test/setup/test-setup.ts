import {createTestContext, TestContext} from "./test-context.js";
import {FileSystem} from "../../src/shared/file-system/file-system.js";
import {createTestFileStructure, TestFile, TestFileStructure} from "./test-file.js";
import {createVirtualFileSystem} from "./create-virtual-file-system.js";
import {TS} from "../../src/type/ts.js";
import {createCompilerHost} from "../../src/shared/compiler-host/create-compiler-host.js";
import {MaybeArray, PartialExcept} from "helpertypes";

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
