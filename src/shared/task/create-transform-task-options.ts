import {realFileSystem} from "../file-system/file-system";
import {TransformTaskOptions} from "./transform-task-options";
import {createTaskOptions} from "./create-task-options";
import {PartialExcept} from "../../type/type-util";
import {isAbsolute, nativeJoin} from "../../transformer/util/path-util";
import {ensureArray} from "../util/util";

export function createTransformTaskOptions({
	fileSystem = realFileSystem,
	write = true,
	input,
	hooks = {},
	outDir,
	...rest
}: PartialExcept<TransformTaskOptions, "input" | "outDir">): TransformTaskOptions {
	if (input == null) {
		throw new ReferenceError(`Missing required argument: 'input'`);
	}

	if (outDir == null) {
		throw new ReferenceError(`Missing required argument: 'outDir'`);
	}

	const taskOptions = createTaskOptions(rest);
	return {
		...taskOptions,
		write,
		fileSystem,
		hooks,
		input: ensureArray(input).map(file => (isAbsolute(file) ? file : nativeJoin(taskOptions.cwd, file))),
		outDir: isAbsolute(outDir) ? outDir : nativeJoin(taskOptions.cwd, outDir)
	};
}
