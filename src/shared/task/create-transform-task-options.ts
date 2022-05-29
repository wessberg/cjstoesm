import {realFileSystem} from "../file-system/file-system.js";
import {TransformTaskOptions} from "./transform-task-options.js";
import {createTaskOptions} from "./create-task-options.js";
import path from "crosspath";
import {ensureArray} from "../util/util.js";
import {PartialExcept} from "helpertypes";

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

	const taskOptions = createTaskOptions(rest);
	return {
		...taskOptions,
		write,
		fileSystem,
		hooks,
		input: ensureArray(input).map(file => path.normalize(path.isAbsolute(file) ? file : path.join(taskOptions.cwd, file))),
		outDir: outDir == null ? undefined : path.normalize(path.isAbsolute(outDir) ? outDir : path.join(taskOptions.cwd, outDir))
	};
}
