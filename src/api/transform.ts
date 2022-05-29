import {transformTask} from "../cli/task/transform/transform-task.js";
import {createTransformTaskOptions} from "../shared/task/create-transform-task-options.js";
import {TransformTaskOptions} from "../shared/task/transform-task-options.js";
import {TransformResult} from "../shared/task/transform-result.js";
import {PartialExcept} from "helpertypes";

export async function transform(options: PartialExcept<TransformTaskOptions, "input" | "outDir">): Promise<TransformResult> {
	return transformTask(createTransformTaskOptions(options));
}
