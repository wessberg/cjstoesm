import {isInDebugMode} from "../util/is-in-debug-mode";
import * as TSModule from "typescript";
import {PartialExcept} from "../../src/type/type-util";
import {TransformTaskOptions} from "../../src/shared/task/transform-task-options";

export interface TestContext extends PartialExcept<TransformTaskOptions, "typescript" | "cwd"> {}

export function createTestContext({preserveModuleSpecifiers, debug = isInDebugMode(), typescript = TSModule, cwd = process.cwd()}: Partial<TestContext> = {}): TestContext {
	return {
		debug,
		preserveModuleSpecifiers,
		typescript,
		cwd
	};
}
