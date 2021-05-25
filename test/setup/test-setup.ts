import {createTestContext, TestContext} from "./test-context";
import {FileSystem} from "../../src/shared/file-system/file-system";
import {createTestFileStructure, TestFile, TestFileStructure} from "./test-file";
import {MaybeArray} from "../../src/type/type-util";
import {createVirtualFileSystem} from "./create-virtual-file-system";
import {TS} from "../../src/type/ts";
import {createCompilerHost} from "../../src/shared/compiler-host/create-compiler-host";

export interface TestSetup {
	context: TestContext;
	fileSystem: FileSystem;
	fileStructure: TestFileStructure;
	compilerHost: TS.CompilerHost;
}

export function createTestSetup(inputFiles: MaybeArray<TestFile>, options?: Partial<TestContext>): TestSetup {
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
