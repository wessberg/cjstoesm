import {isInDebugMode} from "../util/is-in-debug-mode.js";
import {TransformTaskOptions} from "../../src/shared/task/transform-task-options.js";
import {PartialExcept} from "helpertypes";

export interface TestContext extends PartialExcept<TransformTaskOptions, "typescript" | "cwd"> {}

export function createTestContext({
	preserveModuleSpecifiers,
	importAssertions,
	debug = isInDebugMode(),
	typescript,
	cwd = process.cwd()
}: PartialExcept<TestContext, "typescript">): TestContext {
	return {
		debug,
		preserveModuleSpecifiers,
		importAssertions,
		typescript,
		cwd
	};
}
