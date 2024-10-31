import {isInDebugMode} from "../util/is-in-debug-mode.js";
import type {TransformTaskOptions} from "../../src/shared/task/transform-task-options.js";
import type {PartialExcept} from "helpertypes";

export interface TestContext extends PartialExcept<TransformTaskOptions, "typescript" | "cwd"> {}

export function createTestContext({
	preserveModuleSpecifiers,
	importAttributes,
	debug = isInDebugMode(),
	typescript,
	cwd = process.cwd()
}: PartialExcept<TestContext, "typescript">): TestContext {
	return {
		debug,
		preserveModuleSpecifiers,
		importAttributes,
		typescript,
		cwd
	};
}
